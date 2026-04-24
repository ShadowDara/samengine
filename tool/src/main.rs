use std::{collections::HashMap, env, fs, path::Path};

use fluaterm::{self, END, GREEN, RED, YELLOW};
use sakeparser::{parse, run_task, validate_all, RuntimeState};
use win_utf8_rs::enable_utf8;

const PROGNAME: &str = "samtool";

fn help() {
    println!(r#"{}
███████╗ █████╗ ███╗   ███╗███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
██╔════╝██╔══██╗████╗ ████║██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
███████╗███████║██╔████╔██║█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  
╚════██║██╔══██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  
███████║██║  ██║██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝{}
                   
=== Help Menu ===

{}samfile{}:
    This is a file which can be created in the .samengine directory, it
    works a bit simmilliar to makefile and can used to make the build
    process easier.
    
    Execute commands or scripts from it by running {}{}{} build, to run the
    build script.
    
    PS: The File is named {}samfile{}
    PS: Full Guide about it on https://samengine.vercel.app/docs/samfile
    
    Run with --init to create a new samefile in your project directory"#, RED, END, GREEN, END, YELLOW, PROGNAME, END, YELLOW, END)
}

// Run sth from the samfile
fn run_sam_file(command: &str) {
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

fn init() {
    let dir = std::path::Path::new(".samengine");
    let file = dir.join("samfile");

    // ❌ check first
    if dir.exists() && file.exists() {
        println!("samefile already exists — aborting init");
        return;
    }

    println!("Creating a new samfile");

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

    if has_gitignore(&dir2) {
        if let Some(content) = read_gitignore(&dir2) {
            if is_samfile_ignored(&content) {
                println!("samfile is ignored by git");
            } else {
                println!("samfile is NOT ignored");
            }
        }
    }
}

// Main function
fn main() {
    #[cfg(windows)]
    let _ = enable_utf8();

    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("{}{}{}: {}No Argument Provided{} - run with help!", YELLOW, PROGNAME, END, RED, END);
        return;
    }

    let first_arg = &args[1];

    match first_arg.as_str() {
        // Print Help
        "help" | "-h" | "--help" => {
            help()
        }

        // Init
        "--init" => {
            init();
        }

        // When not found
        _ => {
            run_sam_file(first_arg);
        }
    }
}
