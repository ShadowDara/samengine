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

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

/// A single executable instruction inside a [`Task`].
///
/// Commands are created by [`parse`] from indented Samfile lines.
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

            panic!("samfile Cycle detected: {:?}", cycle);
        }

        VisitState::Visited => return,

        VisitState::NotVisited => {}
    }

    // mark as visiting
    state.insert(name.to_string(), VisitState::Visiting);
    stack.push(name.to_string());

    let task = tasks.get(name)
        .expect("task not found");

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

    if line.starts_with("cd ") {
        return Some(Command::Cd(line[3..].to_string()));
    }

    if line.starts_with("run ") {
        let cmd = line[4..].trim();

        if cmd.is_empty() {
            panic!("Invalid empty run command");
        }

        return Some(Command::Run(cmd.to_string()));
    }

    if line.starts_with("env ") {
        // env KEY=VALUE
        let rest = &line[4..];
        let parts: Vec<&str> = rest.split('=').collect();
        if parts.len() == 2 {
            return Some(Command::Env(
                parts[0].to_string(),
                parts[1].to_string(),
            ));
        }
    }

    None
}


// Function to parse the Header of a Task
fn parse_task_header(line: &str) -> (String, Vec<String>) {
    let parts: Vec<&str> = line.split(':').collect();
    let name = parts[0].trim().to_string();

    let deps = if parts.len() > 1 {
        parts[1]
            .split_whitespace()
            .map(|s| s.to_string())
            .collect()
    } else {
        vec![]
    };

    (name, deps)
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
        if trimmed.starts_with('#')
            || trimmed.starts_with("//")
            || trimmed.starts_with("--")
        {
            continue;
        }

        // task header
        if !line.starts_with(' ') && line.contains(':') {
            let (name, deps) = parse_task_header(line);

            tasks.insert(name.clone(), Task {
                deps,
                commands: vec![],
            });

            current = Some(name);
        }

        // command
        else if line.starts_with(' ') {
            if let Some(task_name) = &current {
                match parse_line(line) {
                    Some(cmd) => {
                        tasks.get_mut(task_name)
                            .unwrap()
                            .commands
                            .push(cmd);
                    }

                    None => {
                        // ignore unknown lines (or comments, typos, etc.)
                        eprintln!("warning: ignored invalid line: {}", line);
                    }
                }
            }
        }
    }

    tasks
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
pub fn run_task(
    tasks: &Tasks,
    name: &str,
    visited: &mut HashSet<String>,
    state: &mut RuntimeState,
) {
    if visited.contains(name) {
        return;
    }

    visited.insert(name.to_string());

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

    let mut local_state = RuntimeState {
        cwd: state.cwd.clone(),
        env: state.env.clone(),
    };

    // 1. run dependencies first
    for dep in &task.deps {
        run_task(tasks, dep, visited, &mut local_state);
    }

    println!("\n==> running task: {}\n", name);

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
                unsafe {
                    std::env::set_var(k, v);
                }
            }

            Command::Run(c) => {
                let mut parts = c.split_whitespace();
                let program = parts.next().unwrap();
                let args: Vec<&str> = parts.collect();

                let status = std::process::Command::new(program)
                    .args(args)
                    .current_dir(&state.cwd)   // 🔥 WICHTIG
                    .status()
                    .expect("failed");

                if !status.success() {
                    panic!("task failed");
                }
            }
        }
    }
}
