# Samfile

Samfile is a lightweight task runner configuration format used by **samengine**.  
It is inspired by tools like Make and Just, but designed to be simpler, more readable, and easy to parse in Rust-based tooling.

---

## Overview

A Samfile defines **tasks**. Each task can:

- depend on other tasks
- run shell commands
- change directory
- set environment variables

---

## Basic Syntax

A Samfile is structured like this:

```samfile
task_name: dep1 dep2
    command
    command
```

---

## Example

```samfile
build:
    run cargo build

test: build
    run cargo test

dev: build
    run cargo run
```

---

## Tasks

A task starts with a name followed by `:`.

```samfile
build:
    run echo "building..."
```

### Dependencies

You can define dependencies after `:`:

```samfile
deploy: build test
    run echo "deploying..."
```

This means:

* `build` runs first
* `test` runs second
* then `deploy` executes

---

## Commands

Inside a task, each indented line is a command.

### 1. Run command

```samfile
run npm install
run cargo build
```

Executes a system command.

---

### 2. Change directory

```samfile
cd frontend
run npm install
```

Changes working directory for subsequent commands.

---

### 3. Environment variables

```samfile
env NODE_ENV=production
run npm run build
```

Sets environment variables for the current execution context.

---

## Comments

Samfile supports multiple comment styles:

```samfile
# This is a comment
// This is also a comment
-- This is also valid
```

Comments are ignored during parsing.

---

## File Structure

A typical project using samengine:

```
project/
 ├── .samengine/
 ├───── samfile
 ├── src/
 ├── package.json
 └── Cargo.toml
```

Optionally initialized with:

```
.samengine/
 └── samfile
```

---

## Initialization

You can create a new project with:

```bash
sam --init
```

This will:

* create `.samengine/`
* create a default `samfile`
* optionally check `.gitignore` that the file will not be ignored

---

## Error Handling

If a task is not found:

```
Task 'build' not found

Available tasks:
  - test
  - dev
```

If a dependency is missing:

```
Unknown dependency 'compile' in task 'build'
```

---

## Execution Model

Samengine executes tasks in this order:

1. Resolve dependencies
2. Detect cycles
3. Execute commands sequentially
4. Maintain isolated runtime state per task

---

## Design Notes

* Each task runs in an isolated runtime context
* Directory changes affect only the current task execution
* Dependencies are always executed before the task itself
* Cyclic dependencies are detected and rejected

---

## Limitations (current version)

* No parallel execution yet
* No conditionals (`if`, `when`)
* No variables interpolation
* No caching

---

<!-- ## Future ideas

Planned features:

* parallel tasks
* caching of outputs
* templating system
* variable interpolation (`${VAR}`)
* plugin system
* watch mode (`sam dev --watch`)

--- -->

## Summary

Samfile is designed to be:

* simple
* readable
* fast to parse
* easy to extend

It is a minimal but powerful alternative to traditional build scripts
by samengine.
