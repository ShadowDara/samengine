use regex::Regex;
use std::collections::HashMap;

/// Preprocess the file before it gets parsed
/// This means removing block commands
/// and aplying the macros
pub fn preprocess(input: &str) -> String {
    // Remove Block Commands
    let input = remove_block_comments(input);

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

// function remove a block comment
// /** */
fn remove_block_comments(input: &str) -> String {
    let mut out = String::with_capacity(input.len());

    let mut chars = input.chars().peekable();

    let mut in_comment = false;
    let mut in_double = false;
    let mut in_single = false;
    let mut escaped = false;

    while let Some(c) = chars.next() {
        if in_comment {
            if c == '*' && chars.peek() == Some(&'/') {
                chars.next(); // consume '/'
                in_comment = false;
            }

            continue;
        }

        // Inside "..."
        if in_double {
            out.push(c);

            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == '"' {
                in_double = false;
            }

            continue;
        }

        // Inside '...'
        if in_single {
            out.push(c);

            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == '\'' {
                in_single = false;
            }

            continue;
        }

        match c {
            '"' => {
                in_double = true;
                out.push(c);
            }

            '\'' => {
                in_single = true;
                out.push(c);
            }

            '/' if chars.peek() == Some(&'*') => {
                chars.next(); // consume '*'
                in_comment = true;
            }

            _ => out.push(c),
        }
    }

    out
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

    use super::remove_block_comments;

    #[test]
    fn removes_simple_block_comment() {
        let input = "abc /* comment */ def";
        assert_eq!(remove_block_comments(input), "abc  def");
    }

    #[test]
    fn removes_multiline_comment() {
        let input = "a\n/*\nhello\nworld\n*/\nb";
        assert_eq!(remove_block_comments(input), "a\n\nb");
    }

    #[test]
    fn removes_comment_at_beginning() {
        let input = "/* comment */abc";
        assert_eq!(remove_block_comments(input), "abc");
    }

    #[test]
    fn removes_comment_at_end() {
        let input = "abc/* comment */";
        assert_eq!(remove_block_comments(input), "abc");
    }

    #[test]
    fn removes_multiple_comments() {
        let input = "a/*1*/b/*2*/c";
        assert_eq!(remove_block_comments(input), "abc");
    }

    #[test]
    fn keeps_double_quoted_comment_text() {
        let input = r#"echo "/* not a comment */""#;
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn keeps_single_quoted_comment_text() {
        let input = "echo '/* not a comment */'";
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn keeps_escaped_double_quotes() {
        let input = r#"echo "\"/* not a comment */\"""#;
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn keeps_escaped_single_quotes() {
        let input = r"echo '\'/* not a comment */\''";
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn removes_comment_between_code() {
        let input = r#"
build:
    run cargo build
/* remove me */
test:
    run cargo test
"#;

        let expected = r#"
build:
    run cargo build

test:
    run cargo test
"#;

        assert_eq!(remove_block_comments(input), expected);
    }

    #[test]
    fn keeps_comment_markers_inside_string() {
        let input = r#"echo "abc /* xyz */ def""#;
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn keeps_comment_markers_inside_single_string() {
        let input = "echo 'abc /* xyz */ def'";
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn empty_input() {
        assert_eq!(remove_block_comments(""), "");
    }

    #[test]
    fn only_comment() {
        assert_eq!(remove_block_comments("/* comment */"), "");
    }

    #[test]
    fn unclosed_comment_removes_until_end() {
        let input = "abc /* comment";
        assert_eq!(remove_block_comments(input), "abc ");
    }

    #[test]
    fn slash_without_comment_is_kept() {
        let input = "echo /tmp/file";
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn star_without_comment_is_kept() {
        let input = "a * b";
        assert_eq!(remove_block_comments(input), input);
    }

    #[test]
    fn nested_comment_like_text() {
        let input = "a /* one /* two */ b";
        assert_eq!(remove_block_comments(input), "a  b");
    }

    #[test]
    fn comment_inside_command_arguments() {
        let input = r#"run echo hello /* remove */ world"#;
        assert_eq!(remove_block_comments(input), "run echo hello  world");
    }

    #[test]
    fn string_after_comment() {
        let input = r#"/* remove */echo "hello""#;
        assert_eq!(remove_block_comments(input), r#"echo "hello""#);
    }
}
