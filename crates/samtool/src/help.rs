use fluaterm::{self, BLUE, END, GREEN, PURPLE, RED, YELLOW, functions::{green, purple}};

use crate::PROGNAME;

// Help Message
pub fn help() {
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
    PS: Full Guide about it on {}https://samengine.vercel.app/docs/samfile{}
    
    Run with {}--init{} to create a new samefile in your project directory

{}linksaver{}:
    This is a Tool to save links for your project and then merge them into
    one single file
    
    Use {}{}{} --linksaver -h to get more Information
    or {}-l{} instead of linksaver
    check {}https://samengine.vercel.app/docs/linksaver{} for more Infos

{}:
    Run {} or {} and then a Tag which should be added to the Git Repository
    and pushed to Github.
"#, RED, END, GREEN, END, YELLOW, PROGNAME, END, YELLOW, END, BLUE, END, PURPLE, END, GREEN, END, YELLOW, PROGNAME, END, PURPLE, END, BLUE, END, green("Tags"), purple("-t"), purple("--tag"));
}
