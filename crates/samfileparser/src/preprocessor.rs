// preprocessor for samfiles

use std::collections::HashMap;

pub fn preprocess(input: &str) -> String {
    let mut defines = HashMap::new();
    let mut output = String::new();

    for line in input.lines() {
        let trimmed = line.trim();

        if let Some(rest) = trimmed.strip_prefix("#define ") {
            let mut parts = rest.split_whitespace();
            let key = parts.next().unwrap().to_string();
            let value = parts.next().unwrap_or("").to_string();
            defines.insert(key, value);
            continue;
        }

        let mut replaced = String::new();

        for token in line.split_whitespace() {
            if let Some(val) = defines.get(token) {
                replaced.push_str(val);
            } else {
                replaced.push_str(token);
            }
            replaced.push(' ');
        }

        output.push_str(&replaced.trim_end());
        output.push('\n');
    }

    output
}
