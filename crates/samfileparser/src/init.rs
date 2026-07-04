use std::{collections::HashMap, fs, path::Path};

use fluaterm::GREEN;
use fluaterm::{END, YELLOW};

use crate::RuntimeState;
use crate::parse;
use crate::run_task;
use crate::validate_all;


// Build in samfile for buildin tasks
include!(concat!(env!("OUT_DIR"), "/builtin_filtered.rs"));


/// Defines how execution errors are handled during task execution.
///
/// This controls whether the runner stops immediately, continues execution,
/// or suppresses error output entirely when a command fails.
pub enum ErrorMode {
    /// Stop execution immediately when an error occurs.
    ///
    /// This behaves like a strict mode: any failing command will abort the
    /// entire task execution with a panic.
    FailFast,

    /// Continue execution after an error.
    ///
    /// Errors are printed, but execution continues with the next command
    /// or task.
    Continue,

    /// Suppress error output entirely.
    ///
    /// Failures are ignored silently and do not produce any output.
    Silent,
}

/// Configuration options for executing a Samfile task.
///
/// This struct controls global execution behavior such as debugging output
/// and how errors are handled during runtime.
pub struct RunConfig {
    /// Enables debug output during task execution.
    ///
    /// When enabled, the runner may print additional internal information
    /// such as executed commands and state changes.
    pub debug: bool,

    /// Controls how command and task failures are handled.
    ///
    /// Determines whether execution stops immediately, continues with
    /// warnings, or suppresses error output entirely.
    pub errorMode: ErrorMode,
}

// Helper functions

fn has_gitignore(dir: &str) -> bool {
    Path::new(dir).join(".gitignore").exists()
}

fn read_gitignore(dir: &str) -> Option<String> {
    let path = std::path::Path::new(dir).join(".gitignore");

    fs::read_to_string(path).ok()
}

fn is_samfile_ignored(gitignore_content: &str) -> bool {
    gitignore_content
        .lines()
        .any(|line| line.trim() == "samfile")
}

// Run sth from the samfile
pub fn run_sam_file(command: &str, conf: RunConfig) {
    let mut state = RuntimeState {
        cwd: std::env::current_dir().unwrap(),
        env: HashMap::new(),
    };

    let content = match std::fs::read_to_string(".samengine/samfile") {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error while reading samfile: {}", e);
            return;
        }
    };

    // 👇 combine built-in + file
    let content = format!(
        "{}\n\n{}",
        crate::init::BUILTIN_SAMFILE,
        content
    );

    let tasks = parse(&content, &conf);

    // Check for cycled dependencies
    validate_all(&tasks);

    // Map which one was already visited
    let mut visited = std::collections::HashSet::new();

    // Execute the Task
    run_task(&tasks, command, &mut visited, &mut state, &conf);
}

// Create new samfile
pub fn init() {
    let dir = std::path::Path::new(".samengine");
    let file = dir.join("samfile");

    // check first if exists
    if dir.exists() && file.exists() {
        println!("samefile already exists — aborting init");
        return;
    }

    println!("Creating a new samfile!");

    // Create .samengine Directory
    std::fs::create_dir_all(dir).expect("failed to create directory");

    std::fs::write(&file, "# A new samfile, write your scripts here")
        .expect("failed to create file");

    let dir2 = std::env::current_dir()
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();

    // Check if there is a gitignore
    if has_gitignore(&dir2) {
        if let Some(content) = read_gitignore(&dir2) {
            if is_samfile_ignored(&content) {
                println!("samfile is ignored by git");
            } else {
                println!("{}WARN: samfile is NOT ignored{}", YELLOW, END);
            }
        }
    }
}

// View Tasks
pub fn tasks(conf: RunConfig) {
    let content = match std::fs::read_to_string(".samengine/samfile") {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error while reading samfile: {}", e);
            return;
        }
    };

    let tasks = parse(&content, &conf);

    // Check for cycled dependencies
    validate_all(&tasks);

    // Proint every task
    println!("{}Tasks:{}", YELLOW, END);
    for task in tasks {
        println!(" - {}{}{}", GREEN, task.0, END);
    }
}
