pub fn split_args(line: &str) -> Vec<String> {
    shlex::split(line).expect("invalid quoting")
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
