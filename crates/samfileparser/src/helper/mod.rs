pub mod zip;

use std::path::PathBuf;

use fluaterm::{RED, YELLOW, END};
use fs_extra::{dir, file};

use crate::{CommandWithMeta, RuntimeState, init::{ErrorMode, RunConfig}};

pub fn split_args(line: &str) -> Vec<String> {
    shlex::split(line).expect("invalid quoting")
}

pub fn warn(s: &str) {
    println!("{}{}{}", YELLOW, s, END)
}

pub fn error(s: &str) {
    println!("{}{}{}", RED, s, END)
}

pub fn prompt() {
    use std::io::{self, Write};

    print!("> ");
    io::stdout().flush().unwrap();

    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
}

pub fn unset_env(key: &str, state: &mut RuntimeState) {
    state.env.remove(key);
    unsafe {
        std::env::remove_var(key);
    }
}

pub fn append_file(path: &str, content: &str, state: &RuntimeState) {
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

pub fn write_file(path: &str, content: &str, state: &RuntimeState) {
    let path = state.cwd.join(path);

    std::fs::write(&path, content).unwrap_or_else(|e| panic!("write failed: {}", e));
}

pub fn touch(path: &str, state: &RuntimeState) {
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

pub fn make_dir(path: &str, state: &RuntimeState) {
    let path = if PathBuf::from(path).is_absolute() {
        PathBuf::from(path)
    } else {
        state.cwd.join(path)
    };

    std::fs::create_dir_all(&path).unwrap_or_else(|e| panic!("mkdir '{}': {}", path.display(), e));
}

pub fn copy_path(src: &str, dst: &str, state: &RuntimeState) {
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

pub fn move_path(src: &str, dst: &str, state: &RuntimeState) {
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

pub fn remove_path(path: &str, state: &RuntimeState) {
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

pub fn sleep_for(time: &str) {
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

pub fn run_shell(command: &str, state: &RuntimeState, conf: &RunConfig, cmd: &CommandWithMeta) {
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
        handle_failure("shell command failed", conf, cmd);
    }
}

pub fn handle_failure(msg: &str, conf: &RunConfig, cmd: &CommandWithMeta) {
    match conf.errorMode {
        ErrorMode::FailFast => {
            panic!("Error in line {}\n\"{}\"\n{}", cmd.line, cmd.linstr, msg);
        }
        ErrorMode::Continue => {
            eprintln!("error (ignored): {}", msg);
        }
        ErrorMode::Silent => {
            // komplett still
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::helper::split_args;

    #[test]
    fn split_args_test() {
        assert_eq!(
            split_args(r#"touch "hello world.txt""#),
            vec!["touch", "hello world.txt"]
        );

        assert_eq!(
            split_args(r#"cp "a b.txt" "c d.txt""#),
            vec!["cp", "a b.txt", "c d.txt"]
        );

        assert_eq!(
            split_args(r#"run cargo test --features "foo bar""#),
            vec!["run", "cargo", "test", "--features", "foo bar"]
        );
    }
}
