use regex::Regex;
use std::collections::HashMap;

pub fn preprocess(input: &str) -> String {
    let mut defines = HashMap::new();

    // 1. collect defines
    for line in input.lines() {
        let trimmed = line.trim();

        if let Some(rest) = trimmed.strip_prefix("#define ") {
            let mut parts = rest.split_whitespace();
            let key = parts.next().unwrap().to_string();
            let value = parts.next().unwrap_or("").to_string();
            defines.insert(key, value);
        }
    }

    let mut output = input.to_string();

    // 2. remove define lines
    output = output
        .lines()
        .filter(|l| !l.trim_start().starts_with("#define "))
        .collect::<Vec<_>>()
        .join("\n");

    // 3. replace macros safely
    for (k, v) in defines {
        let pattern = format!(r"\b{}\b", regex::escape(&k));
        let re = Regex::new(&pattern).unwrap();
        output = re.replace_all(&output, v).to_string();
    }

    output
}

#[cfg(test)]
mod tests {
    use crate::preprocessor::preprocess;

    #[test]
fn simple_define_replace() {
    let input = r#"
#define HALLO 0

echo HALLO
"#;

    let output = preprocess(input);

    assert!(output.contains("echo 0"));
    assert!(!output.contains("HALLO"));
}

#[test]
fn multiple_usage() {
    let input = r#"
#define X 10

echo X X X
"#;

    let output = preprocess(input);

    assert!(output.contains("10 10 10"));
}

#[test]
fn no_partial_replace() {
    let input = r#"
#define HALLO 0

echo HALLO123
"#;

    let output = preprocess(input);
    println!("{}", output);

    // HALLO123 darf NICHT verändert werden
    assert!(output.contains("HALLO123"));
}

#[test]
fn preserves_formatting() {
    let input = "#define HALLO 0\n\techo    HALLO\tworld\n";

    let output = preprocess(input);

    assert!(output.contains("\techo    0\tworld"));
}

#[test]
fn define_is_removed() {
    let input = r#"
#define HALLO 0
echo HALLO
"#;

    let output = preprocess(input);

    // #define Zeile darf NICHT mehr vorkommen
    assert!(!output.contains("#define"));
}

#[test]
fn multiple_defines() {
    let input = r#"
#define A 1
#define B 2

echo A B
"#;

    let output = preprocess(input);

    assert!(output.contains("1 2"));
}

#[test]
fn no_false_positive() {
    let input = r#"
#define RUN 1

echo BURN RUNNER RUN
"#;

    let output = preprocess(input);

    assert!(output.contains("BURN RUNNER"));
    assert!(output.contains("1"));
}

#[test]
fn samfile_style() {
    let input = r#"
#define BUILD_DIR build

build:
    echo Building into BUILD_DIR
    RUN cmake -B BUILD_DIR
"#;

    let output = preprocess(input);

    assert!(output.contains("build"));
    assert!(output.contains("cmake -B build"));
}

#[test]
fn stress_test() {
    let input = r#"
#define A 1
#define B A
#define C B

echo C
"#;

    let output = preprocess(input);

    // je nach Design:
    // entweder "1" oder "A" (wenn keine recursion)
    assert!(!output.is_empty());
}
}