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
//! let content = r#"
//! build:
//!     run cargo build
//!
//! test: build
//!     run cargo test
//! "#;
//!
//! let tasks = parse(content);
//! validate_all(&tasks);
//!
//! let mut state = RuntimeState {
//!     cwd: std::env::current_dir().unwrap(),
//!     env: HashMap::new(),
//! };
//! let mut visited = HashSet::new();
//!
//! run_task(&tasks, "test", &mut visited, &mut state);
//! ```

// some more usable functions
pub mod init;

use fluaterm::{END, GREEN};
use fs_extra::{dir, file};
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

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
}

/// HashMap of every Task
type Tasks = HashMap<String, Task>;

/// A named task with dependencies and commands.
///
/// Dependencies are task names that should run before this task. Commands are
/// executed in the order in which they appear in the Samfile.
pub struct Task {
    /// Names of tasks that must run before this task.
    pub deps: Vec<String>,

    /// Commands belonging to this task.
    pub commands: Vec<Command>,
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

//
//
//
//
// HELPER FUNCTIONS
//
//

fn prompt() {
    use std::io::{self, Write};

    print!("> ");
    io::stdout().flush().unwrap();

    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
}

fn unset_env(key: &str, state: &mut RuntimeState) {
    state.env.remove(key);
    unsafe {
        std::env::remove_var(key);
    }
}

fn append_file(path: &str, content: &str, state: &RuntimeState) {
    let path = state.cwd.join(path);

    use std::fs::OpenOptions;

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .expect("append failed");

    use std::io::Write;
    writeln!(file, "{}", content).unwrap();
}

fn write_file(path: &str, content: &str, state: &RuntimeState) {
    let path = state.cwd.join(path);

    std::fs::write(&path, content).unwrap_or_else(|e| panic!("write failed: {}", e));
}

fn touch(path: &str, state: &RuntimeState) {
    let path = if PathBuf::from(path).is_absolute() {
        PathBuf::from(path)
    } else {
        state.cwd.join(path)
    };

    use std::fs::OpenOptions;

    OpenOptions::new()
        .create(true)
        .write(true)
        .open(&path)
        .expect("touch failed");
}

fn make_dir(path: &str, state: &RuntimeState) {
    let path = if PathBuf::from(path).is_absolute() {
        PathBuf::from(path)
    } else {
        state.cwd.join(path)
    };

    std::fs::create_dir_all(&path).unwrap_or_else(|e| panic!("mkdir '{}': {}", path.display(), e));
}

fn copy_path(src: &str, dst: &str, state: &RuntimeState) {
    let src = state.cwd.join(src);
    let dst = state.cwd.join(dst);

    if src.is_dir() {
        let mut options = dir::CopyOptions::new();
        options.copy_inside = true;
        options.overwrite = true;

        dir::copy(src, dst, &options).unwrap();
    } else {
        let mut options = file::CopyOptions::new();
        options.overwrite = true;

        file::copy(src, dst, &options).unwrap();
    }
}

fn move_path(src: &str, dst: &str, state: &RuntimeState) {
    let src = if PathBuf::from(src).is_absolute() {
        PathBuf::from(src)
    } else {
        state.cwd.join(src)
    };

    let dst = if PathBuf::from(dst).is_absolute() {
        PathBuf::from(dst)
    } else {
        state.cwd.join(dst)
    };

    std::fs::rename(src, dst).expect("move failed");
}

fn remove_path(path: &str, state: &RuntimeState) {
    let target = if PathBuf::from(path).is_absolute() {
        PathBuf::from(path)
    } else {
        state.cwd.join(path)
    };

    if !target.exists() {
        return;
    }

    if target.is_dir() {
        std::fs::remove_dir_all(&target)
            .unwrap_or_else(|e| panic!("failed to remove directory '{}': {}", target.display(), e));
    } else {
        std::fs::remove_file(&target)
            .unwrap_or_else(|e| panic!("failed to remove file '{}': {}", target.display(), e));
    }
}

fn sleep_for(time: &str) {
    let duration = if let Some(ms) = time.strip_suffix("ms") {
        std::time::Duration::from_millis(ms.parse().expect("invalid duration"))
    } else if let Some(sec) = time.strip_suffix('s') {
        std::time::Duration::from_secs(sec.parse().expect("invalid duration"))
    } else if let Some(min) = time.strip_suffix('m') {
        std::time::Duration::from_secs(min.parse::<u64>().expect("invalid duration") * 60)
    } else {
        std::time::Duration::from_secs(time.parse().expect("invalid duration"))
    };

    std::thread::sleep(duration);
}

fn run_shell(command: &str, state: &RuntimeState) {
    let status = if cfg!(target_os = "windows") {
        std::process::Command::new("cmd")
            .args(["/C", command])
            .current_dir(&state.cwd)
            .envs(&state.env)
            .status()
            .expect("failed to start shell")
    } else {
        std::process::Command::new("sh")
            .args(["-c", command])
            .current_dir(&state.cwd)
            .envs(&state.env)
            .status()
            .expect("failed to start shell")
    };

    if !status.success() {
        panic!("shell command failed");
    }
}

//
//
// Helper functions ^^^^
//
//

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
fn parse_line(line: &str) -> Option<Command> {
    let line = line.trim();

    // normalize for case-insensitive matching
    let lower = line.to_lowercase();

    // CD
    if lower.starts_with("cd ") {
        return Some(Command::Cd(line[3..].to_string()));
    }

    if lower.starts_with("cdwin ") {
        return Some(Command::CdWin(line[6..].to_string()));
    }

    if lower.starts_with("cdmac ") {
        return Some(Command::CdMac(line[6..].to_string()));
    }

    if lower.starts_with("cdlin ") {
        return Some(Command::CdLin(line[6..].to_string()));
    }

    // RUN
    if lower.starts_with("run ") {
        let cmd = line[4..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty run command");
        }

        return Some(Command::Run(cmd.to_string()));
    }

    if lower.starts_with("runwin ") {
        let cmd = line[7..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty runwin command");
        }

        return Some(Command::RunWin(cmd.to_string()));
    }

    if lower.starts_with("runmac ") {
        let cmd = line[7..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty runmac command");
        }

        return Some(Command::RunMac(cmd.to_string()));
    }

    if lower.starts_with("runlin ") {
        let cmd = line[7..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty runlin command");
        }

        return Some(Command::RunLin(cmd.to_string()));
    }

    // ENV
    if lower.starts_with("env ") {
        // env KEY=VALUE
        let rest = &line[4..];
        if let Some((key, value)) = rest.split_once('=') {
            return Some(Command::Env(key.trim().to_string(), value.to_string()));
        }
    }

    if lower.starts_with("envwin ") {
        // env KEY=VALUE
        let rest = &line[7..];
        if let Some((key, value)) = rest.split_once('=') {
            return Some(Command::EnvWin(key.trim().to_string(), value.to_string()));
        }
    }

    if lower.starts_with("envmac ") {
        // env KEY=VALUE
        let rest = &line[7..];
        if let Some((key, value)) = rest.split_once('=') {
            return Some(Command::EnvMac(key.trim().to_string(), value.to_string()));
        }
    }

    if lower.starts_with("envlin ") {
        // env KEY=VALUE
        let rest = &line[7..];
        if let Some((key, value)) = rest.split_once('=') {
            return Some(Command::EnvLin(key.trim().to_string(), value.to_string()));
        }
    }

    // TASK
    if lower.starts_with("task ") {
        let name = line[5..].trim();

        if name.is_empty() {
            panic!("Invalid empty task command");
        }

        return Some(Command::Task(name.to_string()));
    }

    if lower.starts_with("taskwin ") {
        let name = line[8..].trim();

        if name.is_empty() {
            panic!("Invalid empty taskwin command");
        }

        return Some(Command::TaskWin(name.to_string()));
    }

    if lower.starts_with("taskmac ") {
        let name = line[8..].trim();

        if name.is_empty() {
            panic!("Invalid empty taskmac command");
        }

        return Some(Command::TaskMac(name.to_string()));
    }

    if lower.starts_with("tasklin ") {
        let name = line[8..].trim();

        if name.is_empty() {
            panic!("Invalid empty tasklin command");
        }

        return Some(Command::TaskLin(name.to_string()));
    }

    // RM
    if lower.starts_with("rm ") {
        let path = line[3..].trim();

        if path.is_empty() {
            panic!("Invalid empty rm command");
        }

        return Some(Command::Rm(path.to_string()));
    }

    if lower.starts_with("rmwin ") {
        let path = line[6..].trim();

        if path.is_empty() {
            panic!("Invalid empty rmwin command");
        }

        return Some(Command::RmWin(path.to_string()));
    }

    if lower.starts_with("rmmac ") {
        let path = line[6..].trim();

        if path.is_empty() {
            panic!("Invalid empty rmmac command");
        }

        return Some(Command::RmMac(path.to_string()));
    }

    if lower.starts_with("rmlin ") {
        let path = line[6..].trim();

        if path.is_empty() {
            panic!("Invalid empty rmlin command");
        }

        return Some(Command::RmLin(path.to_string()));
    }

    // MKDIR
    if lower.starts_with("mkdir ") {
        let path = line[6..].trim();

        if path.is_empty() {
            panic!("Invalid empty mkdir command");
        }

        return Some(Command::Mkdir(path.to_string()));
    }

    if lower.starts_with("mkdirwin ") {
        let path = line[9..].trim();

        if path.is_empty() {
            panic!("Invalid empty mkdirwin command");
        }

        return Some(Command::MkdirWin(path.to_string()));
    }

    if lower.starts_with("mkdirmac ") {
        let path = line[9..].trim();

        if path.is_empty() {
            panic!("Invalid empty mkdirmac command");
        }

        return Some(Command::MkdirMac(path.to_string()));
    }

    if lower.starts_with("mkdirlin ") {
        let path = line[9..].trim();

        if path.is_empty() {
            panic!("Invalid empty mkdirlin command");
        }

        return Some(Command::MkdirLin(path.to_string()));
    }

    // CP
    if lower.starts_with("cp ") {
        let rest = line[3..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("cp expects exactly SOURCE DEST");
        }

        return Some(Command::Cp(src.to_string(), dst.to_string()));
    }

    if lower.starts_with("cpwin ") {
        let rest = line[6..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("cpwin expects exactly SOURCE DEST");
        }

        return Some(Command::CpWin(src.to_string(), dst.to_string()));
    }

    if lower.starts_with("cpmac ") {
        let rest = line[6..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("cpmac expects exactly SOURCE DEST");
        }

        return Some(Command::CpMac(src.to_string(), dst.to_string()));
    }

    if lower.starts_with("cplin ") {
        let rest = line[6..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("cplin expects exactly SOURCE DEST");
        }

        return Some(Command::CpLin(src.to_string(), dst.to_string()));
    }

    // MV
    if lower.starts_with("mv ") {
        let rest = line[3..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("mv expects exactly SOURCE DEST");
        }

        return Some(Command::Mv(src.to_string(), dst.to_string()));
    }

    if lower.starts_with("mvwin ") {
        let rest = line[6..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("mvwin expects exactly SOURCE DEST");
        }

        return Some(Command::MvWin(src.to_string(), dst.to_string()));
    }

    if lower.starts_with("mvmac ") {
        let rest = line[6..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("mvmac expects exactly SOURCE DEST");
        }

        return Some(Command::MvMac(src.to_string(), dst.to_string()));
    }

    if lower.starts_with("mvlin ") {
        let rest = line[6..].trim();

        let mut parts = rest.split_whitespace();

        let src = parts.next().expect("missing source");
        let dst = parts.next().expect("missing destination");

        if parts.next().is_some() {
            panic!("mvlin expects exactly SOURCE DEST");
        }

        return Some(Command::MvLin(src.to_string(), dst.to_string()));
    }

    // SLEEP
    if lower.starts_with("sleep ") {
        let time = line[6..].trim();

        if time.is_empty() {
            panic!("Invalid empty sleep command");
        }

        return Some(Command::Sleep(time.to_string()));
    }

    if lower.starts_with("sleepwin ") {
        let time = line[9..].trim();

        if time.is_empty() {
            panic!("Invalid empty sleepwin command");
        }

        return Some(Command::SleepWin(time.to_string()));
    }

    if lower.starts_with("sleepmac ") {
        let time = line[9..].trim();

        if time.is_empty() {
            panic!("Invalid empty sleepmac command");
        }

        return Some(Command::SleepMac(time.to_string()));
    }

    if lower.starts_with("sleeplin ") {
        let time = line[9..].trim();

        if time.is_empty() {
            panic!("Invalid empty sleeplin command");
        }

        return Some(Command::SleepLin(time.to_string()));
    }

    // SHELL
    if lower.starts_with("shell ") {
        let cmd = line[6..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty shell command");
        }

        return Some(Command::Shell(cmd.to_string()));
    }

    if lower.starts_with("shellwin ") {
        let cmd = line[9..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty shellwin command");
        }

        return Some(Command::ShellWin(cmd.to_string()));
    }

    if lower.starts_with("shellmac ") {
        let cmd = line[9..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty shellmac command");
        }

        return Some(Command::ShellMac(cmd.to_string()));
    }

    if lower.starts_with("shelllin ") {
        let cmd = line[9..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty shelllin command");
        }

        return Some(Command::ShellLin(cmd.to_string()));
    }

    // ECHO
    if lower.starts_with("echo ") {
        let cmd = line[5..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty echo command");
        }

        return Some(Command::Echo(cmd.to_string()));
    }

    if lower.starts_with("echowin ") {
        let cmd = line[8..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty echowin command");
        }

        return Some(Command::EchoWin(cmd.to_string()));
    }

    if lower.starts_with("echomac ") {
        let cmd = line[8..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty echomac command");
        }

        return Some(Command::EchoMac(cmd.to_string()));
    }

    if lower.starts_with("echolin ") {
        let cmd = line[8..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty echolin command");
        }

        return Some(Command::EchoLin(cmd.to_string()));
    }

    // TOUCH
    if lower.starts_with("touch ") {
        return Some(Command::Touch(line[6..].trim().to_string()));
    }

    if lower.starts_with("touchwin ") {
        return Some(Command::TouchWin(line[9..].trim().to_string()));
    }

    if lower.starts_with("touchmac ") {
        return Some(Command::TouchMac(line[9..].trim().to_string()));
    }

    if lower.starts_with("touchlin ") {
        return Some(Command::TouchLin(line[9..].trim().to_string()));
    }

    // WRITE
    if lower.starts_with("write ") {
        let rest = line[6..].trim();
        let (path, content) = rest.split_once(' ').expect("write PATH CONTENT");

        return Some(Command::Write(path.to_string(), content.to_string()));
    }

    if lower.starts_with("writewin ") {
        let rest = line[9..].trim();
        let (path, content) = rest.split_once(' ').expect("writewin PATH CONTENT");

        return Some(Command::WriteWin(path.to_string(), content.to_string()));
    }

    if lower.starts_with("writemac ") {
        let rest = line[9..].trim();
        let (path, content) = rest.split_once(' ').expect("writemac PATH CONTENT");

        return Some(Command::WriteMac(path.to_string(), content.to_string()));
    }

    if lower.starts_with("writelin ") {
        let rest = line[9..].trim();
        let (path, content) = rest.split_once(' ').expect("writelin PATH CONTENT");

        return Some(Command::WriteLin(path.to_string(), content.to_string()));
    }

    // APPEND
    if lower.starts_with("append ") {
        let rest = line[7..].trim();
        let (path, content) = rest.split_once(' ').expect("append PATH CONTENT");

        return Some(Command::Append(path.to_string(), content.to_string()));
    }

    if lower.starts_with("appendwin ") {
        let rest = line[10..].trim();
        let (path, content) = rest.split_once(' ').expect("appendwin PATH CONTENT");

        return Some(Command::AppendWin(path.to_string(), content.to_string()));
    }

    if lower.starts_with("appendmac ") {
        let rest = line[10..].trim();
        let (path, content) = rest.split_once(' ').expect("appendmac PATH CONTENT");

        return Some(Command::AppendMac(path.to_string(), content.to_string()));
    }

    if lower.starts_with("appendlin") {
        let rest = line[10..].trim();
        let (path, content) = rest.split_once(' ').expect("appendlin PATH CONTENT");

        return Some(Command::AppendLin(path.to_string(), content.to_string()));
    }

    if lower.starts_with("unsetenv ") {
        return Some(Command::UnsetEnv(line[9..].trim().to_string()));
    }

    if lower.starts_with("unsetenvwin ") {
        return Some(Command::UnsetEnvWin(line[12..].trim().to_string()));
    }

    if lower.starts_with("unsetenvmac ") {
        return Some(Command::UnsetEnvMac(line[12..].trim().to_string()));
    }

    if lower.starts_with("unsetenvlin ") {
        return Some(Command::UnsetEnvLin(line[12..].trim().to_string()));
    }

    if lower.starts_with("prompt") {
        return Some(Command::Prompt());
    }

    if lower.starts_with("promptwin") {
        return Some(Command::PromptWin());
    }

    if lower.starts_with("promptmac") {
        return Some(Command::PromptMac());
    }

    if lower.starts_with("promptlin") {
        return Some(Command::PromptLin());
    }

    None
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
pub fn parse(content: &str) -> Tasks {
    let mut tasks = HashMap::new();
    let mut current: Option<String> = None;

    for line in content.lines() {
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
        if !line.starts_with(' ') && line.contains(':') {
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
        else if line.starts_with(' ') {
            if let Some(task_name) = &current {
                match parse_line(line) {
                    Some(cmd) => {
                        tasks.get_mut(task_name).unwrap().commands.push(cmd);
                    }

                    None => {
                        // ignore unknown lines (or comments, typos, etc.)
                        eprintln!("warning: ignored invalid line: {}", line);
                    }
                }
            }
        } else {
            eprintln!("warning: line outside of task: {}", line);
        }
    }

    tasks
}

fn run_command(command: &str, state: &RuntimeState) {
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
        panic!("task failed");
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
        run_task(tasks, dep, visited, &mut local_state);
    }

    println!("\n==> {}running task{}: {}\n", GREEN, END, name);

    // 2. run commands
    for cmd in &task.commands {
        match cmd {
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
                run_command(c, state);
            }

            Command::RunWin(c) => {
                if cfg!(target_os = "windows") {
                    run_command(c, state);
                }
            }

            Command::RunMac(c) => {
                if cfg!(target_os = "macos") {
                    run_command(c, state);
                }
            }

            Command::RunLin(c) => {
                if cfg!(target_os = "linux") {
                    run_command(c, state);
                }
            }

            // TASK
            Command::Task(name) => {
                run_task(tasks, name, visited, state);
            }

            Command::TaskWin(name) => {
                if cfg!(target_os = "windows") {
                    run_task(tasks, name, visited, state);
                }
            }

            Command::TaskMac(name) => {
                if cfg!(target_os = "macos") {
                    run_task(tasks, name, visited, state);
                }
            }

            Command::TaskLin(name) => {
                if cfg!(target_os = "linux") {
                    run_task(tasks, name, visited, state);
                }
            }

            // RM
            Command::Rm(path) => {
                remove_path(path, state);
            }

            Command::RmWin(path) => {
                if cfg!(target_os = "windows") {
                    remove_path(path, state);
                }
            }

            Command::RmMac(path) => {
                if cfg!(target_os = "macos") {
                    remove_path(path, state);
                }
            }

            Command::RmLin(path) => {
                if cfg!(target_os = "linux") {
                    remove_path(path, state);
                }
            }

            // MKDIR
            Command::Mkdir(path) => {
                make_dir(path, state);
            }

            Command::MkdirWin(path) => {
                if cfg!(target_os = "windows") {
                    make_dir(path, state);
                }
            }

            Command::MkdirMac(path) => {
                if cfg!(target_os = "macos") {
                    make_dir(path, state);
                }
            }

            Command::MkdirLin(path) => {
                if cfg!(target_os = "linux") {
                    make_dir(path, state);
                }
            }

            // CP
            Command::Cp(src, dst) => {
                copy_path(src, dst, state);
            }

            Command::CpWin(src, dst) => {
                if cfg!(target_os = "windows") {
                    copy_path(src, dst, state);
                }
            }

            Command::CpMac(src, dst) => {
                if cfg!(target_os = "macos") {
                    copy_path(src, dst, state);
                }
            }

            Command::CpLin(src, dst) => {
                if cfg!(target_os = "linux") {
                    copy_path(src, dst, state);
                }
            }

            // MV
            Command::Mv(src, dst) => {
                move_path(src, dst, state);
            }

            Command::MvWin(src, dst) => {
                if cfg!(target_os = "windows") {
                    move_path(src, dst, state);
                }
            }

            Command::MvMac(src, dst) => {
                if cfg!(target_os = "macos") {
                    move_path(src, dst, state);
                }
            }

            Command::MvLin(src, dst) => {
                if cfg!(target_os = "linux") {
                    move_path(src, dst, state);
                }
            }

            // SLEEP
            Command::Sleep(time) => {
                sleep_for(time);
            }

            Command::SleepWin(time) => {
                if cfg!(target_os = "windows") {
                    sleep_for(time);
                }
            }

            Command::SleepMac(time) => {
                if cfg!(target_os = "macos") {
                    sleep_for(time);
                }
            }

            Command::SleepLin(time) => {
                if cfg!(target_os = "linux") {
                    sleep_for(time);
                }
            }

            // SHELL
            Command::Shell(cmd) => {
                run_shell(cmd, state);
            }

            Command::ShellWin(cmd) => {
                if cfg!(target_os = "windows") {
                    run_shell(cmd, state);
                }
            }

            Command::ShellMac(cmd) => {
                if cfg!(target_os = "macos") {
                    run_shell(cmd, state);
                }
            }

            Command::ShellLin(cmd) => {
                if cfg!(target_os = "linux") {
                    run_shell(cmd, state);
                }
            }

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

            // TOUCH
            Command::Touch(p) => touch(p, state),

            Command::TouchWin(p) => {
                if cfg!(target_os = "windows") {
                    touch(p, state)
                }
            }

            Command::TouchMac(p) => {
                if cfg!(target_os = "macos") {
                    touch(p, state)
                }
            }

            Command::TouchLin(p) => {
                if cfg!(target_os = "linux") {
                    touch(p, state)
                }
            }

            // WRITE
            Command::Write(p, c) => write_file(p, c, state),

            Command::WriteWin(p, c) => {
                if cfg!(target_os = "windows") {
                    write_file(p, c, state)
                }
            }

            Command::WriteMac(p, c) => {
                if cfg!(target_os = "macos") {
                    write_file(p, c, state)
                }
            }

            Command::WriteLin(p, c) => {
                if cfg!(target_os = "linux") {
                    write_file(p, c, state)
                }
            }

            // APPEND
            Command::Append(p, c) => append_file(p, c, state),

            Command::AppendWin(p, c) => {
                if cfg!(target_os = "windows") {
                    append_file(p, c, state)
                }
            }

            Command::AppendMac(p, c) => {
                if cfg!(target_os = "macos") {
                    append_file(p, c, state)
                }
            }

            Command::AppendLin(p, c) => {
                if cfg!(target_os = "linux") {
                    append_file(p, c, state)
                }
            }

            // UNSETENV
            Command::UnsetEnv(k) => unset_env(k, state),

            Command::UnsetEnvWin(k) => {
                if cfg!(target_os = "windows") {
                    unset_env(k, state)
                }
            }

            Command::UnsetEnvMac(k) => {
                if cfg!(target_os = "macos") {
                    unset_env(k, state)
                }
            }

            Command::UnsetEnvLin(k) => {
                if cfg!(target_os = "linux") {
                    unset_env(k, state)
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

    fn make_state() -> RuntimeState {
        RuntimeState {
            cwd: std::env::current_dir().unwrap(),
            env: HashMap::new(),
        }
    }

    #[test]
    fn parse_basic_task() {
        let input = r#"
        build:
            run echo hello
        "#;

        let tasks = parse(input);
        assert!(tasks.contains_key("build"));
        assert_eq!(tasks["build"].commands.len(), 1);
    }

    #[test]
    fn parse_dependencies() {
        let input = r#"
        a:
        b: a
        "#;

        let tasks = parse(input);
        assert_eq!(tasks["b"].deps, vec!["a"]);
    }

    #[test]
    fn detect_cycle() {
        let input = r#"
        a: b
        b: a
        "#;

        let tasks = parse(input);

        let result = std::panic::catch_unwind(|| validate_all(&tasks));
        assert!(result.is_err());
    }

    #[test]
    fn parse_env() {
        let input = r#"
        t:
            env KEY=value
        "#;

        let tasks = parse(input);
        match tasks["t"].commands[0] {
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

        let tasks = parse(input);
        match &tasks["t"].commands[0] {
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

        let tasks = parse(input);
        validate_all(&tasks);

        let mut state = make_state();
        let mut visited = HashSet::new();

        run_task(&tasks, "a", &mut visited, &mut state);
    }

    #[test]
    fn run_task_with_dependency() {
        let input = r#"
        a:
            echo A

        b: a
            echo B
        "#;

        let tasks = parse(input);
        validate_all(&tasks);

        let mut state = make_state();
        let mut visited = HashSet::new();

        run_task(&tasks, "b", &mut visited, &mut state);
    }

    #[test]
    fn case_insensitive_parser() {
        let input = r#"
        t:
            ENV KEY=value
            RuN echo hello
        "#;

        let tasks = parse(input);
        assert!(matches!(tasks["t"].commands[0], Command::Env(_, _)));
        assert!(matches!(tasks["t"].commands[1], Command::Run(_)));
    }
}
