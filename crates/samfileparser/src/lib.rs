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

use fluaterm::{END, GREEN};
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

/// A single executable instruction inside a [`Task`].
///
/// Commands are created by [`parse`] from indented Samfile lines.
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

    /// Run a program with whitespace-separated arguments.
    ///
    /// For example, `run cargo test` becomes `Run("cargo test")`.
    Run(String),

    /// Set an environment variable as `KEY=VALUE`.
    Env(String, String),

    RunWin(String),
    RunMac(String),
    RunLin(String),
}

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

    if line.starts_with("cd ") || line.starts_with("CD ") {
        return Some(Command::Cd(line[3..].to_string()));
    }

    if line.starts_with("run ") || line.starts_with("RUN ") {
        let cmd = line[4..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty run command");
        }

        return Some(Command::Run(cmd.to_string()));
    }

    if line.starts_with("runwin ") || line.starts_with("RUNWIN ") {
        let cmd = line[7..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty runwin command");
        }

        return Some(Command::RunWin(cmd.to_string()));
    }

    if line.starts_with("runmac ") || line.starts_with("RUNMAC ") {
        let cmd = line[7..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty runmac command");
        }

        return Some(Command::RunMac(cmd.to_string()));
    }

    if line.starts_with("runlin ") || line.starts_with("RUNLIN ") {
        let cmd = line[7..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty runlin command");
        }

        return Some(Command::RunLin(cmd.to_string()));
    }

    if line.starts_with("env ") || line.starts_with("ENV ") {
        // env KEY=VALUE
        let rest = &line[4..];
        if let Some((key, value)) = rest.split_once('=') {
            return Some(Command::Env(key.trim().to_string(), value.to_string()));
        }
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

            Command::Env(k, v) => {
                state.env.insert(k.clone(), v.clone());
            }

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
        }
    }
}
