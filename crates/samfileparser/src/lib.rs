use std::path::PathBuf;
use std::{collections::HashMap};
use std::collections::HashSet;

// Commands
pub enum Command {
    Cd(String),
    Run(String),
    Env(String, String),
}

type Tasks = HashMap<String, Task>;

pub struct Task {
    pub deps: Vec<String>,
    pub commands: Vec<Command>,
}


enum VisitState {
    NotVisited,
    Visiting,
    Visited,
}

// Runtime Path for every Script
pub struct RuntimeState {
    pub cwd: PathBuf,
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


// To detect Cycles
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


// Function to Parse the File
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


// Function to run a Task
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
