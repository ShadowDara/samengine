use std::process::Command;

pub fn add_tag(tag: &str) {
    // git tag <tag>
    let tag_cmd = Command::new("git")
        .args(["tag", tag])
        .output();

    match tag_cmd {
        Ok(output) if output.status.success() => {}
        Ok(output) => {
            eprintln!(
                "Error creating tag: {}",
                String::from_utf8_lossy(&output.stderr)
            );
            return;
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            return;
        }
    }

    // git push origin <tag>
    let push_cmd = Command::new("git")
        .args(["push", "origin", tag])
        .output();

    match push_cmd {
        Ok(output) if output.status.success() => {
            println!("Pushed Tag {} to GitHub", tag);
        }
        Ok(output) => {
            eprintln!(
                "Error pushing tag: {}",
                String::from_utf8_lossy(&output.stderr)
            );
        }
        Err(e) => {
            eprintln!("Error: {}", e);
        }
    }
}
