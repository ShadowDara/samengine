# samfileparser

`samfileparser` is a small Rust library for parsing and running Samfiles:
simple, Makefile-inspired command files with named tasks, dependencies, and
indented commands.

It is useful when you want a tiny task format for project scripts without
pulling in a full build system.

## [Samfile Docs](https://shadowdara.github.io/docs/#/samfile)

## Samfile format

A Samfile is made of task headers and indented command lines.

```text
# This is a comment
// This is also a comment
-- This too

build:
    run cargo build

test: build
    run cargo test

install: build
    cd dist
    env PROFILE=release
    run echo Installing
```

Task headers start at the beginning of a line:

```text
task-name: dependency-a dependency-b
```

Command lines must be indented with at least one space:

```text
    run cargo test
```

Empty lines are ignored. Comments can start with `#`, `//`, or `--`.

## Commands

There a lot for more commands in this version! Go to [docs.rs](https://docs.rs/samfileparser/latest/samfileparser/) to see more infos!

### `run`

Runs a program in the current runtime directory.

```text
build:
    run cargo build
```

Arguments are split by whitespace.

### `cd`

Changes the runtime directory for following commands.

```text
docs:
    cd website
    run npm run build
```

Relative paths are resolved against the current runtime directory. The path must
exist.

### `env`

Sets an environment variable.

```text
release:
    env PROFILE=release
    run cargo build
```

The expected syntax is:

```text
env KEY=VALUE
```

## Library usage

```rust
use samfileparser::{parse, run_task, validate_all, RuntimeState};
use std::collections::{HashMap, HashSet};

fn main() {
    let content = r#"
build:
    run cargo build

test: build
    run cargo test
"#;

    let tasks = parse(content);

    // Recommended before running user-provided files.
    validate_all(&tasks);

    let mut state = RuntimeState {
        cwd: std::env::current_dir().expect("current directory should exist"),
        env: HashMap::new(),
    };
    let mut visited = HashSet::new();

    run_task(&tasks, "test", &mut visited, &mut state);
}
```

## Execution order

Dependencies run before the task that depends on them.

```text
build:
    run cargo build

install: build
    run cargo install --path .
```

Running `install` executes `build` first, then `install`.

Each task is only run once per `run_task` call tree because the runner uses a
`visited` set.

## Validation

Call `validate_all(&tasks)` after parsing and before running tasks.

Validation checks for:

- dependencies that reference missing tasks
- dependency cycles, for example `a -> b -> a`

The current API reports validation failures with panics.

## Error behavior

The crate currently uses simple failure behavior:

- invalid or unknown command lines are ignored and printed as warnings
- missing tasks are printed with a list of available tasks
- unknown dependencies panic during validation
- dependency cycles panic during validation
- failed `cd` commands panic
- failed process starts panic
- non-zero process exits panic

For best results, validate first and then run the requested task.

## Public API

### `parse(content: &str)`

Parses Samfile text into a task map.

### `validate_all(tasks)`

Checks all task dependencies for missing references and cycles.

### `run_task(tasks, name, visited, state)`

Runs a task by name, including its dependencies.

### `Task`

Represents one parsed task:

- `deps`: task names that should run first
- `commands`: parsed commands for the task

### `Command`

Represents one command:

- `Command::Cd(path)`
- `Command::Run(command)`
- `Command::Env(key, value)`

### `RuntimeState`

Holds runtime execution state:

- `cwd`: current working directory for command execution
- `env`: runtime environment values

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).
