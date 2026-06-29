use std::{collections::HashMap, fs, path::Path};

use fluaterm::{YELLOW, END};

use crate::run_task;
use crate::validate_all;
use crate::parse;
use crate::RuntimeState;

// Run sth from the samfile
pub fn run_sam_file(command: &str) {
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

    let tasks = parse(&content);

    // Check for cycled dependencies
    validate_all(&tasks);

    // Map which one was already visited
    let mut visited = std::collections::HashSet::new();

    // Execute the Task
    run_task(&tasks, command, &mut visited, &mut state);
}

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
    std::fs::create_dir_all(dir)
        .expect("failed to create directory");

    std::fs::write(
        &file,
        "# A new samfile, write your scripts here"
    )
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
