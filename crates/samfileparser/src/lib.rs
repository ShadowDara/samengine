//! Parser and lightweight runner for Samfiles.
//!
//! A Samfile is a small, Makefile-inspired task file. It contains named tasks,
//! optional dependencies between those tasks, and indented commands that are
//! executed in order.
//!
//! # File format
//!
//! ```text
//! # comments can start with #, //, or --
//! build:
//!     run cargo build
//!
//! test: build
//!     run cargo test
//! ```
//!
//! Task headers start at the beginning of a line and use `name: dep dep`.
//! Command lines must be indented with at least one space. Empty lines and
//! comments are ignored.
//!
//! Supported commands are:
//!
//! - `cd PATH` changes the working directory for following commands.
//! - `env KEY=VALUE` sets an environment variable.
//! - `run PROGRAM ARG...` runs a process in the current runtime directory.
//!
//! # Example
//!
//! ```no_run
//! use samfileparser::{parse, run_task, validate_all, RuntimeState};
//! use std::collections::{HashMap, HashSet};
//!
//! use samfileparser::init::RunConfig;
//! use samfileparser::init::ErrorMode;
//!
//! let content = r#"
//! build:
//!     run cargo build
//!
//! test: build
//!     run cargo test
//! "#;
//! 
//! fn make_conf() -> RunConfig {
//!     let conf = RunConfig {
//!         debug: false,
//!         errorMode: ErrorMode::FailFast,
//!     };
//!     return conf;
//! }
//!
//! let tasks = parse(content, &make_conf());
//! validate_all(&tasks);
//!
//! let mut state = RuntimeState {
//!     cwd: std::env::current_dir().unwrap(),
//!     env: HashMap::new(),
//! };
//! let mut visited = HashSet::new();
//!
//! let conf = RunConfig {
//!     debug: false,
//!     errorMode: ErrorMode::FailFast
//! };
//!
//! run_task(&tasks, "test", &mut visited, &mut state, &conf);
//! ```

// some more usable functions
pub mod fstree;
pub mod init;

mod helper;
mod preprocessor;

use fluaterm::{END, GREEN, RED, YELLOW};
use fs_extra::{dir, file};
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

use crate::helper::{append_file, copy_path, error, handle_failure, make_dir, move_path, prompt, remove_path, run_shell, sleep_for, split_args, touch, unset_env, warn, write_file};
use crate::init::{ErrorMode, RunConfig};
use crate::preprocessor::preprocess;

/// A single executable instruction inside a [`Task`].
///
/// Commands are created by [`parse`] from indented Samfile lines.
///
/// Every command also has optional platform-specific variants (`*Win`,
/// `*Mac`, `*Lin`) that are only executed when running on the matching
/// operating system.
///
/// Dependencies execute in an isolated RuntimeState clone.
///
/// Changes made by dependency tasks (such as `cd` or `env`) do not
/// propagate back to the dependent task.
#[derive(Debug)]
pub enum Command {
    /// Change the current runtime directory.
    ///
    /// Relative paths are resolved against the current runtime directory.
    Cd(String),

    /// Change the current runtime directory on Windows only.
    ///
    /// This command is ignored on other operating systems.
    CdWin(String),

    /// Change the current runtime directory on macOS only.
    ///
    /// This command is ignored on other operating systems.
    CdMac(String),

    /// Change the current runtime directory on Linux only.
    ///
    /// This command is ignored on other operating systems.
    CdLin(String),

    /// Set an environment variable as `KEY=VALUE`.
    ///
    /// The value is stored in the current [`RuntimeState`] and passed to all
    /// following child processes started by [`Command::Run`] or
    /// [`Command::Shell`].
    Env(String, String),

    /// Set an environment variable on Windows only.
    EnvWin(String, String),

    /// Set an environment variable on MacOS only.
    EnvMac(String, String),

    /// Set an environment variable on Linux only.
    EnvLin(String, String),

    /// Run a program with whitespace-separated arguments.
    ///
    /// For example:
    ///
    /// ```text
    /// run cargo test
    /// ```
    ///
    /// becomes
    ///
    /// ```text
    /// cargo test
    /// ```
    ///
    /// executed in the current runtime directory.
    Run(String),

    /// Run a program on Windows only.
    RunWin(String),

    /// Run a program on macOS only.
    RunMac(String),

    /// Run a program on Linux only.
    RunLin(String),

    /// Execute another task.
    ///
    /// The referenced task and all of its dependencies are executed before
    /// execution continues with the current task.
    Task(String),

    /// Execute another task on Windows only.
    TaskWin(String),

    /// Execute another task on macOS only.
    TaskMac(String),

    /// Execute another task on Linux only.
    TaskLin(String),

    /// Remove a file or directory.
    ///
    /// Directories are removed recursively.
    ///
    /// Missing paths are ignored.
    Rm(String),

    /// Remove a file or directory on Windows only.
    RmWin(String),

    /// Remove a file or directory on macOS only.
    RmMac(String),

    /// Remove a file or directory on Linux only.
    RmLin(String),

    /// Create a directory and all missing parent directories.
    ///
    /// Equivalent to `mkdir -p`.
    Mkdir(String),

    /// Create a directory on Windows only.
    MkdirWin(String),

    /// Create a directory on macOS only.
    MkdirMac(String),

    /// Create a directory on Linux only.
    MkdirLin(String),

    /// Copy a file or directory.
    ///
    /// Directories are copied recursively.
    Cp(String, String),

    /// Copy a file or directory on Windows only.
    CpWin(String, String),

    /// Copy a file or directory on macOS only.
    CpMac(String, String),

    /// Copy a file or directory on Linux only.
    CpLin(String, String),

    /// Move or rename a file or directory.
    Mv(String, String),

    /// Move or rename a file or directory on Windows only.
    MvWin(String, String),

    /// Move or rename a file or directory on macOS only.
    MvMac(String, String),

    /// Move or rename a file or directory on Linux only.
    MvLin(String, String),

    /// Pause execution for a period of time.
    ///
    /// Supported formats include:
    ///
    /// - `5`
    /// - `5s`
    /// - `250ms`
    /// - `2m`
    Sleep(String),

    /// Pause execution on Windows only.
    SleepWin(String),

    /// Pause execution on macOS only.
    SleepMac(String),

    /// Pause execution on Linux only.
    SleepLin(String),

    /// Execute a command through the system shell.
    ///
    /// On Unix systems this uses `sh -c`.
    ///
    /// On Windows this uses `cmd /C`.
    Shell(String),

    /// Execute a shell command on Windows only.
    ShellWin(String),

    /// Execute a shell command on macOS only.
    ShellMac(String),

    /// Execute a shell command on Linux only.
    ShellLin(String),

    /// Print text followed by a newline.
    ///
    /// Unlike [`Command::Run`], this does not start an external process.
    Echo(String),

    /// Print text on Windows only.
    EchoWin(String),

    /// Print text on macOS only.
    EchoMac(String),

    /// Print text on Linux only.
    EchoLin(String),

    /// Generic warning message.
    ///
    /// Indicates a non-fatal issue that does not stop execution.
    /// Typically used when something unexpected or suboptimal occurs,
    /// but the program can continue safely.
    Warn(String),

    /// Windows-specific warning message.
    ///
    /// Only relevant when running on Windows. Ignored on other platforms.
    /// Used for platform-specific issues or behavior differences.
    WarnWin(String),

    /// macOS-specific warning message.
    ///
    /// Only relevant when running on macOS. Ignored on other platforms.
    /// Used for platform-specific issues or behavior differences.
    WarnMac(String),

    /// Linux-specific warning message.
    ///
    /// Only relevant when running on Linux. Ignored on other platforms.
    /// Used for platform-specific issues or behavior differences.
    WarnLin(String),

    /// Generic error message.
    ///
    /// Indicates a fatal or blocking issue that prevents successful execution
    /// of a task or operation.
    Error(String),

    /// Windows-specific error message.
    ///
    /// Only relevant when running on Windows. Ignored on other platforms.
    /// Represents a platform-specific failure condition.
    ErrorWin(String),

    /// macOS-specific error message.
    ///
    /// Only relevant when running on macOS. Ignored on other platforms.
    /// Represents a platform-specific failure condition.
    ErrorMac(String),

    /// Linux-specific error message.
    ///
    /// Only relevant when running on Linux. Ignored on other platforms.
    /// Represents a platform-specific failure condition.
    ErrorLin(String),

    /// Create an empty file or update its timestamp.
    ///
    /// If the file does not exist, it will be created.
    /// If it already exists, its modification time is updated.
    ///
    /// This is equivalent to the Unix `touch` command.
    Touch(String),

    /// Create an empty file or update its timestamp on Windows only.
    ///
    /// This command is ignored on other operating systems.
    TouchWin(String),

    /// Create an empty file or update its timestamp on macOS only.
    ///
    /// This command is ignored on other operating systems.
    TouchMac(String),

    /// Create an empty file or update its timestamp on Linux only.
    ///
    /// This command is ignored on other operating systems.
    TouchLin(String),

    /// Write content to a file.
    ///
    /// If the file already exists, it will be overwritten.
    ///
    /// If it does not exist, it will be created.
    Write(String, String),

    /// Write content to a file on Windows only.
    ///
    /// This command is ignored on other operating systems.
    WriteWin(String, String),

    /// Write content to a file on macOS only.
    ///
    /// This command is ignored on other operating systems.
    WriteMac(String, String),

    /// Write content to a file on Linux only.
    ///
    /// This command is ignored on other operating systems.
    WriteLin(String, String),

    /// Append content to a file.
    ///
    /// If the file does not exist, it will be created.
    /// A newline is typically added after the appended content.
    Append(String, String),

    /// Append content to a file on Windows only.
    ///
    /// This command is ignored on other operating systems.
    AppendWin(String, String),

    /// Append content to a file on macOS only.
    ///
    /// This command is ignored on other operating systems.
    AppendMac(String, String),

    /// Append content to a file on Linux only.
    ///
    /// This command is ignored on other operating systems.
    AppendLin(String, String),

    /// Remove a variable from the runtime environment.
    ///
    /// This only affects the current runtime state and child processes
    /// spawned after this command.
    UnsetEnv(String),

    /// Remove a variable from the runtime environment on Windows only.
    ///
    /// This command is ignored on other operating systems.
    UnsetEnvWin(String),

    /// Remove a variable from the runtime environment on macOS only.
    ///
    /// This command is ignored on other operating systems.
    UnsetEnvMac(String),

    /// Remove a variable from the runtime environment on Linux only.
    ///
    /// This command is ignored on other operating systems.
    UnsetEnvLin(String),

    /// Wait for user input from standard input.
    ///
    /// This pauses execution until the user presses Enter.
    ///
    /// Useful for debugging or interactive scripts.
    Prompt(),

    /// Wait for user input on Windows only.
    ///
    /// This command is ignored on other operating systems.
    PromptWin(),

    /// Wait for user input on macOS only.
    ///
    /// This command is ignored on other operating systems.
    PromptMac(),

    /// Wait for user input on Linux only.
    ///
    /// This command is ignored on other operating systems.
    PromptLin(),
    //
    //
    //
    // IDEAS
    // - exists
    // - printenv
    // - pwd
    // - ls
    // - extract
    // - downlaod
    // - clear
    // - open
    /// ERROR COMMAND TYPE
    THIS_COMMAND_WAS_WRONG_ERROR(),
}

/// HashMap of every Task
type Tasks = HashMap<String, Task>;

/// Repräsentiert einen Command zusammen mit Metadaten.
///
/// Diese Struktur wird verwendet, um einen Command zusammen mit der
/// Zeilennummer zu speichern, in der er im Quelltext vorkommt.
pub struct CommandWithMeta {
    /// Der eigentliche Command, der ausgeführt werden soll.
    pub command: Command,

    /// Die Zeilennummer im Quelltext, an der der Command definiert ist.
    pub line: usize,

    /// The Line as String.
    pub linstr: String,
}

/// A named task with dependencies and commands.
///
/// Dependencies are task names that should run before this task. Commands are
/// executed in the order in which they appear in the Samfile.
pub struct Task {
    /// Names of tasks that must run before this task.
    pub deps: Vec<String>,

    /// Commands belonging to this task.
    pub commands: Vec<CommandWithMeta>,
}

enum VisitState {
    NotVisited,
    Visiting,
    Visited,
}

/// Mutable runtime context used while executing tasks.
///
/// The runner uses `cwd` as the process working directory for [`Command::Run`]
/// and updates it when a [`Command::Cd`] command succeeds.
pub struct RuntimeState {
    /// Current working directory for task execution.
    pub cwd: PathBuf,

    /// Environment values associated with the runtime.
    ///
    /// The current runner clones this map for dependency execution. `env`
    /// commands also set variables on the process environment.
    pub env: HashMap<String, String>,
}

fn detect_cycles(
    tasks: &Tasks,
    name: &str,
    state: &mut HashMap<String, VisitState>,
    stack: &mut Vec<String>,
) {
    match state.get(name).unwrap_or(&VisitState::NotVisited) {
        VisitState::Visiting => {
            // CYCLE FOUND
            let cycle_start = match stack.iter().position(|n| n == name) {
                Some(i) => i,
                None => {
                    panic!("Internal error: cycle detection state corrupted");
                }
            };

            let cycle = &stack[cycle_start..];

            panic!("Cycle detected: {:?}", cycle);
        }

        VisitState::Visited => return,

        VisitState::NotVisited => {}
    }

    // mark as visiting
    state.insert(name.to_string(), VisitState::Visiting);
    stack.push(name.to_string());

    let task = tasks.get(name).expect("task not found");

    // Check Unknow dependencies
    for dep in &task.deps {
        if !tasks.contains_key(dep) {
            panic!("Unknown dependency '{}' in task '{}'", dep, name);
        }
    }

    for dep in &task.deps {
        detect_cycles(tasks, dep, state, stack);
    }

    stack.pop();
    state.insert(name.to_string(), VisitState::Visited);
}

/// Validate task dependencies.
///
/// This checks every task for:
///
/// - dependencies that do not exist in the parsed task map
/// - dependency cycles such as `a -> b -> a`
///
/// # Panics
///
/// Panics when a task references an unknown dependency or when a dependency
/// cycle is found.
pub fn validate_all(tasks: &Tasks) {
    let mut state = HashMap::new();
    let mut stack = vec![];

    for task in tasks.keys() {
        detect_cycles(tasks, task, &mut state, &mut stack);
    }
}

// Function to parse a Line
fn parse_line(line: &str, conf: &RunConfig, idx: usize) -> Option<Command> {
    let args = split_args(line).clone();

    if args.is_empty() {
        return None;
    }

    let cmd = args[0].to_lowercase();

    let metadata = &CommandWithMeta {
        command: Command::THIS_COMMAND_WAS_WRONG_ERROR(),
        line: idx,
        linstr: line.to_string(),
    };

    match cmd.as_str() {
        // CD
        "cd" => {
            if args.len() < 2 {
                handle_failure("cd PATH", conf, metadata);
            }

            return Some(Command::Cd(args[1].clone()));
        }

        "cdwin" => {
            if args.len() < 2 {
                handle_failure("cdwin PATH", conf, metadata);
            }

            return Some(Command::CdWin(args[1].clone()));
        }

        "cdmac" => {
            if args.len() < 2 {
                handle_failure("cdmac PATH", conf, metadata);
            }

            return Some(Command::CdMac(args[1].clone()));
        }

        "cdlin" => {
            if args.len() < 2 {
                handle_failure("cdlin PATH", conf, metadata);
            }

            return Some(Command::CdLin(args[1].clone()));
        }

        // RUN
        "run" => {
            if args.len() < 2 {
                handle_failure("Invalid empty run command", conf, metadata);
            }

            return Some(Command::Run(args[1..].join(" ")));
        }

        "runwin " => {
            if args.len() < 2 {
                handle_failure("Invalid empty runwin command", conf, metadata);
            }

            return Some(Command::RunWin(args[1..].join(" ")));
        }

        "runmac " => {
            if args.len() < 2 {
                handle_failure("Invalid empty runmac command", conf, metadata);
            }

            return Some(Command::RunMac(args[1..].join(" ")));
        }

        "runlin " => {
            if args.len() < 2 {
                handle_failure("Invalid empty runlin command", conf, metadata);
            }

            return Some(Command::RunLin(args[1..].join(" ")));
        }

        // ENV
        "env" => {
            if args.len() <= 1 {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
            }

            // env KEY=VALUE
            if let Some((key, value)) = args[1].split_once('=') {
                return Some(Command::Env(key.trim().to_string(), value.to_string()));
            } else {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
                return None;
            }
        }

        "envwin" => {
            if args.len() <= 1 {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
            }

            // env KEY=VALUE
            if let Some((key, value)) = args[1].split_once('=') {
                return Some(Command::EnvWin(key.trim().to_string(), value.to_string()));
            } else {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
                return None;
            }
        }

        "envmac" => {
            if args.len() <= 1 {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
            }

            // env KEY=VALUE
            if let Some((key, value)) = args[1].split_once('=') {
                return Some(Command::EnvMac(key.trim().to_string(), value.to_string()));
            } else {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
                return None;
            }
        }

        "envlin" => {
            if args.len() <= 1 {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
            }

            // env KEY=VALUE
            if let Some((key, value)) = args[1].split_once('=') {
                return Some(Command::EnvLin(key.trim().to_string(), value.to_string()));
            } else {
                handle_failure("Invalid env command: env KEY=VALUE", conf, metadata);
                return None;
            }
        }

        // TASK
        "task" => {
            if args.len() <= 1 {
                handle_failure("Invalid empty task command", conf, metadata);
            }

            return Some(Command::Task(args[1].clone()));
        }

        "taskwin" => {
            if args.len() <= 1 {
                handle_failure("Invalid empty taskwin command", conf, metadata);
            }

            return Some(Command::TaskWin(args[1].clone()));
        }

        "taskmac" => {
            if args.len() <= 1 {
                handle_failure("Invalid empty taskmac command", conf, metadata);
            }

            return Some(Command::TaskMac(args[1].clone()));
        }

        "tasklin" => {
            if args.len() <= 1 {
                handle_failure("Invalid empty tasklin command", conf, metadata);
            }

            return Some(Command::TaskLin(args[1].clone()));
        }

        // RM
        "rm" => {
            if args.len() < 2 {
                handle_failure("Invalid empty rm command", conf, metadata);
            }

            let path = args[1..].join(" ");

            return Some(Command::Rm(path.to_string()));
        }

        "rmwin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty rmwin command", conf, metadata);
            }

            let path = args[1..].join(" ");

            return Some(Command::RmWin(path.to_string()));
        }

        "rmmac" => {
            if args.len() < 2 {
                handle_failure("Invalid empty rmmac command", conf, metadata);
            }

            let path = args[1..].join(" ");

            return Some(Command::RmMac(path.to_string()));
        }

        "rmlin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty rmlin command", conf, metadata);
            }

            let path = args[1..].join(" ");

            return Some(Command::RmLin(path.to_string()));
        }

        // MKDIR
        "mkdir" => {
            if args.len() < 2 {
                handle_failure("Invalid empty mkdir command", conf, metadata);
            }

            let path = args[1..].join(" ");

            return Some(Command::Mkdir(path.to_string()));
        }

        "mkdirwin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty mkdirwin command", conf, metadata);
            }

            let path = args[1..].join(" ");

            return Some(Command::MkdirWin(path.to_string()));
        }

        "mkdirmac" => {
            if args.len() < 2 {
                handle_failure("Invalid empty mkdirmac command", conf, metadata);
            }
            let path = args[1..].join(" ");

            return Some(Command::MkdirMac(path.to_string()));
        }

        "mkdirlin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty mkdirlin command", conf, metadata);
            }
            let path = args[1..].join(" ");

            return Some(Command::MkdirLin(path.to_string()));
        }

        // CP
        "cp" => {
            if args.len() < 3 {
                handle_failure("cp expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::Cp(args[1].clone(), args[2].clone()));
        }

        "cpwin" => {
            if args.len() < 3 {
                handle_failure("cp expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::CpWin(args[1].clone(), args[2].clone()));
        }

        "cpmac" => {
            if args.len() < 3 {
                handle_failure("cp expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::CpMac(args[1].clone(), args[2].clone()));
        }

        "cplin" => {
            if args.len() < 3 {
                handle_failure("cp expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::CpLin(args[1].clone(), args[2].clone()));
        }

        // MV
        "mv" => {
            if args.len() < 3 {
                handle_failure("mv expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::Mv(args[1].clone(), args[2].clone()));
        }

        "mvwin" => {
            if args.len() < 3 {
                handle_failure("mvwin expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::MvWin(args[1].clone(), args[2].clone()));
        }

        "mvmac" => {
            if args.len() < 3 {
                handle_failure("mvmac expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::MvMac(args[1].clone(), args[2].clone()));
        }

        "mvlin" => {
            if args.len() < 3 {
                handle_failure("mvlin expects exactly SOURCE DEST", conf, metadata);
            }

            return Some(Command::MvLin(args[1].clone(), args[2].clone()));
        }

        // SLEEP
        "sleep" => {
            if args.len() < 2 {
                handle_failure("Invalid empty sleep command", conf, metadata);
            }

            return Some(Command::Sleep(args[1].clone()));
        }

        "sleepwin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty sleepwin command", conf, metadata);
            }

            return Some(Command::SleepWin(args[1].clone()));
        }

        "sleepmac" => {
            if args.len() < 2 {
                handle_failure("Invalid empty sleepmac command", conf, metadata);
            }

            return Some(Command::SleepMac(args[1].clone()));
        }

        "sleeplin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty sleeplin command", conf, metadata);
            }

            return Some(Command::SleepLin(args[1].clone()));
        }

        // SHELL
        "shell" => {
            if args.len() < 2 {
                handle_failure("Invalid empty shell command", conf, metadata);
            }

            let cmd = args[1..].join(" ");

            return Some(Command::Shell(cmd));
        }

        "shellwin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty shellwin command", conf, metadata);
            }

            let cmd = args[1..].join(" ");

            return Some(Command::ShellWin(cmd));
        }

        "shellmac" => {
            if args.len() < 2 {
                handle_failure("Invalid empty shellmac command", conf, metadata);
            }

            let cmd = args[1..].join(" ");

            return Some(Command::ShellMac(cmd));
        }

        "shelllin" => {
            if args.len() < 2 {
                handle_failure("Invalid empty shelllin command", conf, metadata);
            }

            let cmd = args[1..].join(" ");

            return Some(Command::ShellLin(cmd));
        }

        // ECHO
        "echo" => {
            if args.len() < 2 {
                return Some(Command::Echo(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::Echo(cmd));
        }

        "echowin" => {
            if args.len() < 2 {
                return Some(Command::EchoWin(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::EchoWin(cmd.to_string()));
        }

        "echomac" => {
            if args.len() < 2 {
                return Some(Command::EchoMac(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::EchoMac(cmd.to_string()));
        }

        "echolin" => {
            if args.len() < 2 {
                return Some(Command::EchoLin(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::EchoLin(cmd.to_string()));
        }

        // WARN
        "warn" => {
            if args.len() < 2 {
                return Some(Command::Warn(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::Warn(cmd.to_string()));
        }

        "warnwin" => {
            if args.len() < 2 {
                return Some(Command::WarnWin(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::WarnWin(cmd.to_string()));
        }

        "warnmac" => {
            if args.len() < 2 {
                return Some(Command::WarnMac(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::WarnMac(cmd.to_string()));
        }

        "warnlin" => {
            if args.len() < 2 {
                return Some(Command::WarnLin(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::WarnLin(cmd.to_string()));
        }

        // ERROR
        "error" => {
            if args.len() < 2 {
                return Some(Command::Error(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::Error(cmd.to_string()));
        }

        "errorwin" => {
            if args.len() < 2 {
                return Some(Command::ErrorWin(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::ErrorWin(cmd.to_string()));
        }

        "errormac" => {
            if args.len() < 2 {
                return Some(Command::ErrorMac(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::ErrorMac(cmd.to_string()));
        }

        "errorlin" => {
            if args.len() < 2 {
                return Some(Command::ErrorLin(String::new()));
            }

            let cmd = args[1..].join(" ");

            return Some(Command::ErrorLin(cmd.to_string()));
        }

        // TOUCH
        "touch" => {
            if args.len() < 2 {
                handle_failure("Invalid touch command: touch <filename>", conf, metadata);
            }

            return Some(Command::Touch(args[1..].join(" ").to_string()));
        }

        "touchwin" => {
            if args.len() < 2 {
                handle_failure("Invalid touch command: touch <filename>", conf, metadata);
            }

            return Some(Command::TouchWin(args[1..].join(" ").to_string()));
        }

        "touchmac" => {
            if args.len() < 2 {
                handle_failure("Invalid touch command: touch <filename>", conf, metadata);
            }

            return Some(Command::TouchMac(args[1..].join(" ").to_string()));
        }

        "touchlin" => {
            if args.len() < 2 {
                handle_failure("Invalid touch command: touch <filename>", conf, metadata);
            }

            return Some(Command::TouchLin(args[1..].join(" ").to_string()));
        }

        // WRITE
        "write" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid write command: write <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[2..].join(" ");

            return Some(Command::Write(args[1].clone(), rest));
        }

        "writewin" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid write command: write <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[2..].join(" ");

            return Some(Command::WriteWin(args[1].clone(), rest));
        }

        "writemac" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid write command: write <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[2..].join(" ");

            return Some(Command::WriteMac(args[1].clone(), rest));
        }

        "writelin" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid write command: write <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[1..].join(" ");

            return Some(Command::WriteLin(args[1].clone(), rest.to_string()));
        }

        // APPEND
        "append" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid append command: append <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[1..].join(" ");

            return Some(Command::Append(args[1].clone(), rest.to_string()));
        }

        "appendwin" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid append command: append <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[1..].join(" ");

            return Some(Command::AppendWin(args[1].clone(), rest.to_string()));
        }

        "appendmac" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid append command: append <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[1..].join(" ");

            return Some(Command::AppendMac(args[1].clone(), rest.to_string()));
        }

        "appendlin" => {
            if args.len() < 3 {
                handle_failure(
                    "Invalid append command: append <filename> <content>",
                    conf,
                    metadata,
                );
            }

            let rest = args[1..].join(" ");

            return Some(Command::AppendLin(args[1].clone(), rest.to_string()));
        }

        "unsetenv" => {
            if args.len() < 2 {
                handle_failure(
                    "Invalid unsetenvh command: unsetenv <envvar>",
                    conf,
                    metadata,
                );
            }

            return Some(Command::UnsetEnv(args[1].clone()));
        }

        "unsetenvwin " => {
            if args.len() < 2 {
                handle_failure(
                    "Invalid unsetenvh command: unsetenv <envvar>",
                    conf,
                    metadata,
                );
            }

            return Some(Command::UnsetEnvWin(args[1].clone()));
        }

        "unsetenvmac" => {
            if args.len() < 2 {
                handle_failure(
                    "Invalid unsetenvh command: unsetenv <envvar>",
                    conf,
                    metadata,
                );
            }

            return Some(Command::UnsetEnvMac(args[1].clone()));
        }

        "unsetenvlin" => {
            if args.len() < 2 {
                handle_failure(
                    "Invalid unsetenvh command: unsetenv <envvar>",
                    conf,
                    metadata,
                );
            }

            return Some(Command::UnsetEnvLin(args[1].clone()));
        }

        "prompt" => {
            return Some(Command::Prompt());
        }

        "promptwin" => {
            return Some(Command::PromptWin());
        }

        "promptmac" => {
            return Some(Command::PromptMac());
        }

        "promptlin" => {
            return Some(Command::PromptLin());
        }

        _ => return None,
    }
}

// Function to parse the Header of a Task
fn parse_task_header(line: &str) -> (String, Vec<String>) {
    let (name, deps_part) = line.split_once(':').expect("invalid task header");

    let name = name.trim();

    if name.is_empty() {
        panic!("Task name cannot be empty");
    }

    let deps = deps_part
        .split_whitespace()
        .map(|s| s.to_string())
        .collect();

    (name.trim().to_string(), deps)
}

/// Parse Samfile content into tasks.
///
/// The parser is intentionally small and permissive:
///
/// - empty lines are ignored
/// - comments beginning with `#`, `//`, or `--` are ignored
/// - task headers are non-indented lines containing `:`
/// - command lines are indented with at least one leading space
/// - unknown command lines are ignored and reported as warnings
///
/// The returned map is keyed by task name.
pub fn parse(content: &str, conf: &RunConfig) -> Tasks {
    // add preprocessor
    let content = preprocess(content);

    let mut tasks = HashMap::new();
    let mut current: Option<String> = None;

    for (idx, line) in content.lines().enumerate() {
        let line_no = idx + 1; // <-- wichtig
        let line = line.trim_end();

        let trimmed = line.trim();

        // ignore empty lines
        if trimmed.is_empty() {
            continue;
        }

        // ignore comments
        if trimmed.starts_with('#') || trimmed.starts_with("//") || trimmed.starts_with("--") {
            continue;
        }

        // task header
        if !line.starts_with(char::is_whitespace) && line.contains(':') {
            let (name, deps) = parse_task_header(line);

            if tasks.contains_key(&name) {
                panic!("Duplicate task '{}'", name);
            }

            tasks.insert(
                name.clone(),
                Task {
                    deps,
                    commands: vec![],
                },
            );

            current = Some(name);
        }
        // command
        else if line.chars().next().map_or(false, |c| c.is_whitespace()) {
            if let Some(task_name) = &current {
                match parse_line(line, conf, idx) {
                    Some(cmd) => {
                        tasks
                            .get_mut(task_name)
                            .unwrap()
                            .commands
                            .push(CommandWithMeta {
                                command: cmd,
                                line: line_no,
                                linstr: line.to_string(),
                            });
                    }

                    None => {
                        // ignore unknown lines (or comments, typos, etc.)
                        eprintln!("{}warning: ignored invalid line: {}{}", YELLOW, line, END);
                    }
                }
            }
        } else {
            eprintln!("{}warning: line outside of task: {}{}", YELLOW, line, END);
        }
    }

    tasks
}

fn run_command(command: &str, state: &RuntimeState, conf: &RunConfig, cmd: &CommandWithMeta) {
    let mut parts = command.split_whitespace();

    let program = parts.next().unwrap();

    let args: Vec<&str> = parts.collect();

    let status = std::process::Command::new(program)
        .args(args)
        .current_dir(&state.cwd)
        .envs(&state.env)
        .status()
        .expect("failed");

    if !status.success() {
        handle_failure("task failed", conf, cmd);
    }
}

/// Run a task and its dependencies.
///
/// Dependencies run before the requested task. The `visited` set prevents the
/// same task from running more than once during a call tree.
///
/// Call [`validate_all`] before running user-provided files if you want missing
/// dependencies and cycles to fail early with clearer messages.
///
/// # Panics
///
/// Panics when:
///
/// - a `cd` command points to a path that does not exist
/// - a `run` command cannot be started
/// - a process exits with a non-success status
///
/// The current runner clones this state before executing dependencies.
/// Dependency modifications are isolated and discarded when the dependency
/// finishes.
pub fn run_task(
    tasks: &Tasks,
    name: &str,
    visited: &mut HashSet<String>,
    state: &mut RuntimeState,
    conf: &RunConfig,
) {
    if visited.contains(name) {
        return;
    }

    let task = match tasks.get(name) {
        Some(t) => t,
        None => {
            let mut msg = format!("Task '{}' not found\n", name);

            msg.push_str("Available tasks:\n");
            for key in tasks.keys() {
                msg.push_str(&format!("  - {}\n", key));
            }

            println!("\n{}", msg);

            // no panic on the titanic
            // panic!("{}", msg);

            return;
        }
    };

    visited.insert(name.to_string());

    let mut local_state = RuntimeState {
        cwd: state.cwd.clone(),
        env: state.env.clone(),
    };

    // 1. run dependencies first
    for dep in &task.deps {
        run_task(tasks, dep, visited, &mut local_state, conf);
    }

    println!("\n==> {}running task{}: {}\n", GREEN, END, name);

    // 2. run commands
    for cmd in &task.commands {
        if conf.debug {
            println!("[{}EXECUTING{}] {}", GREEN, END, cmd.linstr);
        }

        match &cmd.command {
            // CD
            Command::Cd(path) => {
                let new_path = if PathBuf::from(path).is_absolute() {
                    PathBuf::from(path)
                } else {
                    state.cwd.join(path)
                };

                println!("> cd {}", new_path.display());

                state.cwd = match new_path.canonicalize() {
                    Ok(p) => p,
                    Err(_) => {
                        panic!("cd failed: path does not exist: {}", new_path.display());
                    }
                };
            }

            Command::CdWin(path) => {
                if cfg!(target_os = "windows") {
                    let new_path = if PathBuf::from(path).is_absolute() {
                        PathBuf::from(path)
                    } else {
                        state.cwd.join(path)
                    };

                    println!("> cd {}", new_path.display());

                    state.cwd = match new_path.canonicalize() {
                        Ok(p) => p,
                        Err(_) => {
                            panic!("cd failed: path does not exist: {}", new_path.display());
                        }
                    };
                }
            }

            Command::CdMac(path) => {
                if cfg!(target_os = "macos") {
                    let new_path = if PathBuf::from(path).is_absolute() {
                        PathBuf::from(path)
                    } else {
                        state.cwd.join(path)
                    };

                    println!("> cd {}", new_path.display());

                    state.cwd = match new_path.canonicalize() {
                        Ok(p) => p,
                        Err(_) => {
                            panic!("cd failed: path does not exist: {}", new_path.display());
                        }
                    };
                }
            }

            Command::CdLin(path) => {
                if cfg!(target_os = "linux") {
                    let new_path = if PathBuf::from(path).is_absolute() {
                        PathBuf::from(path)
                    } else {
                        state.cwd.join(path)
                    };

                    println!("> cd {}", new_path.display());

                    state.cwd = match new_path.canonicalize() {
                        Ok(p) => p,
                        Err(_) => {
                            panic!("cd failed: path does not exist: {}", new_path.display());
                        }
                    };
                }
            }

            // ENV
            Command::Env(k, v) => {
                state.env.insert(k.clone(), v.clone());
            }

            Command::EnvWin(k, v) => {
                if cfg!(target_os = "windows") {
                    state.env.insert(k.clone(), v.clone());
                }
            }

            Command::EnvMac(k, v) => {
                if cfg!(target_os = "macos") {
                    state.env.insert(k.clone(), v.clone());
                }
            }

            Command::EnvLin(k, v) => {
                if cfg!(target_os = "linux") {
                    state.env.insert(k.clone(), v.clone());
                }
            }

            // RUN
            Command::Run(c) => {
                run_command(&c, state, conf, cmd);
            }

            Command::RunWin(c) => {
                if cfg!(target_os = "windows") {
                    run_command(&c, state, conf, cmd);
                }
            }

            Command::RunMac(c) => {
                if cfg!(target_os = "macos") {
                    run_command(&c, state, conf, cmd);
                }
            }

            Command::RunLin(c) => {
                if cfg!(target_os = "linux") {
                    run_command(&c, state, conf, cmd);
                }
            }

            // TASK
            Command::Task(name) => {
                run_task(tasks, &name, visited, state, conf);
            }

            Command::TaskWin(name) => {
                if cfg!(target_os = "windows") {
                    run_task(tasks, &name, visited, state, conf);
                }
            }

            Command::TaskMac(name) => {
                if cfg!(target_os = "macos") {
                    run_task(tasks, &name, visited, state, conf);
                }
            }

            Command::TaskLin(name) => {
                if cfg!(target_os = "linux") {
                    run_task(tasks, &name, visited, state, conf);
                }
            }

            // RM
            Command::Rm(path) => {
                remove_path(&path, state);
            }

            Command::RmWin(path) => {
                if cfg!(target_os = "windows") {
                    remove_path(&path, state);
                }
            }

            Command::RmMac(path) => {
                if cfg!(target_os = "macos") {
                    remove_path(&path, state);
                }
            }

            Command::RmLin(path) => {
                if cfg!(target_os = "linux") {
                    remove_path(&path, state);
                }
            }

            // MKDIR
            Command::Mkdir(path) => {
                make_dir(&path, state);
            }

            Command::MkdirWin(path) => {
                if cfg!(target_os = "windows") {
                    make_dir(&path, state);
                }
            }

            Command::MkdirMac(path) => {
                if cfg!(target_os = "macos") {
                    make_dir(&path, state);
                }
            }

            Command::MkdirLin(path) => {
                if cfg!(target_os = "linux") {
                    make_dir(&path, state);
                }
            }

            // CP
            Command::Cp(src, dst) => {
                copy_path(&src, &dst, state);
            }

            Command::CpWin(src, dst) => {
                if cfg!(target_os = "windows") {
                    copy_path(&src, &dst, state);
                }
            }

            Command::CpMac(src, dst) => {
                if cfg!(target_os = "macos") {
                    copy_path(&src, &dst, state);
                }
            }

            Command::CpLin(src, dst) => {
                if cfg!(target_os = "linux") {
                    copy_path(&src, &dst, state);
                }
            }

            // MV
            Command::Mv(src, dst) => {
                move_path(&src, &dst, state);
            }

            Command::MvWin(src, dst) => {
                if cfg!(target_os = "windows") {
                    move_path(&src, &dst, state);
                }
            }

            Command::MvMac(src, dst) => {
                if cfg!(target_os = "macos") {
                    move_path(&src, &dst, state);
                }
            }

            Command::MvLin(src, dst) => {
                if cfg!(target_os = "linux") {
                    move_path(&src, &dst, state);
                }
            }

            // SLEEP
            Command::Sleep(time) => {
                sleep_for(&time);
            }

            Command::SleepWin(time) => {
                if cfg!(target_os = "windows") {
                    sleep_for(&time);
                }
            }

            Command::SleepMac(time) => {
                if cfg!(target_os = "macos") {
                    sleep_for(&time);
                }
            }

            Command::SleepLin(time) => {
                if cfg!(target_os = "linux") {
                    sleep_for(&time);
                }
            }

            // SHELL
            Command::Shell(cmde) => {
                run_shell(&cmde, state, conf, cmd);
            }

            Command::ShellWin(cmde) => {
                if cfg!(target_os = "windows") {
                    run_shell(&cmde, state, conf, cmd);
                }
            }

            Command::ShellMac(cmde) => {
                if cfg!(target_os = "macos") {
                    run_shell(&cmde, state, conf, cmd);
                }
            }

            Command::ShellLin(cmde) => {
                if cfg!(target_os = "linux") {
                    run_shell(&cmde, state, conf, cmd);
                }
            }

            // ECHO
            Command::Echo(cmd) => {
                println!("{}", cmd);
            }

            Command::EchoWin(cmd) => {
                if cfg!(target_os = "windows") {
                    println!("{}", cmd);
                }
            }

            Command::EchoMac(cmd) => {
                if cfg!(target_os = "macos") {
                    println!("{}", cmd);
                }
            }

            Command::EchoLin(cmd) => {
                if cfg!(target_os = "linux") {
                    println!("{}", cmd);
                }
            }

            // WARN
            Command::Warn(cmd) => {
                warn(&cmd);
            }

            Command::WarnWin(cmd) => {
                if cfg!(target_os = "windows") {
                    warn(&cmd);
                }
            }

            Command::WarnMac(cmd) => {
                if cfg!(target_os = "macos") {
                    warn(&cmd);
                }
            }

            Command::WarnLin(cmd) => {
                if cfg!(target_os = "linux") {
                    warn(&cmd);
                }
            }

            // ERROR
            Command::Error(cmd) => {
                error(&cmd);
            }

            Command::ErrorWin(cmd) => {
                if cfg!(target_os = "windows") {
                    error(&cmd);
                }
            }

            Command::ErrorMac(cmd) => {
                if cfg!(target_os = "macos") {
                    error(&cmd);
                }
            }

            Command::ErrorLin(cmd) => {
                if cfg!(target_os = "linux") {
                    error(&cmd);
                }
            }

            // TOUCH
            Command::Touch(p) => touch(&p, state),

            Command::TouchWin(p) => {
                if cfg!(target_os = "windows") {
                    touch(&p, state)
                }
            }

            Command::TouchMac(p) => {
                if cfg!(target_os = "macos") {
                    touch(&p, state)
                }
            }

            Command::TouchLin(p) => {
                if cfg!(target_os = "linux") {
                    touch(&p, state)
                }
            }

            // WRITE
            Command::Write(p, c) => write_file(&p, &c, state),

            Command::WriteWin(p, c) => {
                if cfg!(target_os = "windows") {
                    write_file(&p, &c, state)
                }
            }

            Command::WriteMac(p, c) => {
                if cfg!(target_os = "macos") {
                    write_file(&p, &c, state)
                }
            }

            Command::WriteLin(p, c) => {
                if cfg!(target_os = "linux") {
                    write_file(&p, &c, state)
                }
            }

            // APPEND
            Command::Append(p, c) => append_file(&p, &c, state),

            Command::AppendWin(p, c) => {
                if cfg!(target_os = "windows") {
                    append_file(&p, &c, state)
                }
            }

            Command::AppendMac(p, c) => {
                if cfg!(target_os = "macos") {
                    append_file(&p, &c, state)
                }
            }

            Command::AppendLin(p, c) => {
                if cfg!(target_os = "linux") {
                    append_file(&p, &c, state)
                }
            }

            // UNSETENV
            Command::UnsetEnv(k) => unset_env(&k, state),

            Command::UnsetEnvWin(k) => {
                if cfg!(target_os = "windows") {
                    unset_env(&k, state)
                }
            }

            Command::UnsetEnvMac(k) => {
                if cfg!(target_os = "macos") {
                    unset_env(&k, state)
                }
            }

            Command::UnsetEnvLin(k) => {
                if cfg!(target_os = "linux") {
                    unset_env(&k, state)
                }
            }

            // PROMPT
            Command::Prompt() => prompt(),

            Command::PromptWin() => {
                if cfg!(target_os = "windows") {
                    prompt()
                }
            }

            Command::PromptMac() => {
                if cfg!(target_os = "macos") {
                    prompt()
                }
            }

            Command::PromptLin() => {
                if cfg!(target_os = "linux") {
                    prompt()
                }
            }

            // ERROR TYPE
            Command::THIS_COMMAND_WAS_WRONG_ERROR() => {
                println!("{}This Command was wrong!{}", RED, END);
            }
        }
    }
}

// ======================================
//
//  TESTS
//
// ======================================

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::{HashMap, HashSet};

    use crate::init::ErrorMode;
    use crate::init::RunConfig;

    fn make_state() -> RuntimeState {
        RuntimeState {
            cwd: std::env::current_dir().unwrap(),
            env: HashMap::new(),
        }
    }

    fn make_conf() -> RunConfig {
        let conf = RunConfig {
            debug: false,
            errorMode: ErrorMode::FailFast,
        };
        return conf;
    }

    #[test]
    fn parse_basic_task() {
        let input = r#"

build:
    run echo hello
"#;

        let tasks = parse(input, &make_conf());
        assert!(tasks.contains_key("build"));
        assert_eq!(tasks["build"].commands.len(), 1);
    }

    #[test]
    fn parse_dependencies() {
        let input = r#"
a:
b: a
"#;

        let tasks = parse(input, &make_conf());
        assert_eq!(tasks["b"].deps, vec!["a"]);
    }

    #[test]
    fn detect_cycle() {
        let input = r#"
a: b
b: a
"#;

        let tasks = parse(input, &make_conf());

        let result = std::panic::catch_unwind(|| validate_all(&tasks));
        assert!(result.is_err());
    }

    #[test]
    fn parse_env() {
        let input = r#"
t:
    env KEY=value
"#;

        let tasks = parse(input, &make_conf());
        match tasks["t"].commands[0].command {
            Command::Env(ref k, ref v) => {
                assert_eq!(k, "KEY");
                assert_eq!(v, "value");
            }
            _ => panic!("wrong command"),
        }
    }

    #[test]
    fn parse_rm() {
        let input = r#"
t:
    rm test.txt
"#;

        let tasks = parse(input, &make_conf());
        match &tasks["t"].commands[0].command {
            Command::Rm(p) => assert_eq!(p, "test.txt"),
            _ => panic!("wrong command"),
        }
    }

    #[test]
    fn run_task_basic() {
        let input = r#"
a:
    echo hello
"#;

        let tasks = parse(input, &make_conf());
        validate_all(&tasks);

        let mut state = make_state();
        let mut visited = HashSet::new();

        run_task(&tasks, "a", &mut visited, &mut state, &make_conf());
    }

    #[test]
    fn run_task_with_dependency() {
        let input = r#"
a:
    echo A

b: a
    echo B
"#;

        let tasks = parse(input, &make_conf());
        validate_all(&tasks);

        let mut state = make_state();
        let mut visited = HashSet::new();

        run_task(&tasks, "b", &mut visited, &mut state, &make_conf());
    }

    #[test]
    fn case_insensitive_parser() {
        let input = r#"
t:
    ENV KEY=value
    RuN echo hello
"#;

        let tasks = parse(input, &make_conf());
        assert!(matches!(tasks["t"].commands[0].command, Command::Env(_, _)));
        assert!(matches!(tasks["t"].commands[1].command, Command::Run(_)));
    }
}
