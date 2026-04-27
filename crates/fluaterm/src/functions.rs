// Functions to color the Text

use crate::{BLACK, RED, GREEN, YELLOW, BLUE, PURPLE, CYAN, WHITE, END};

pub fn black(input: &str) -> String {
    format!("{}{}{}", BLACK, input, END)
}

pub fn red(input: &str) -> String {
    format!("{}{}{}", RED, input, END)
}

pub fn green(input: &str) -> String {
    format!("{}{}{}", GREEN, input, END)
}

pub fn yellow(input: &str) -> String {
    format!("{}{}{}", YELLOW, input, END)
}

pub fn blue(input: &str) -> String {
    format!("{}{}{}", BLUE, input, END)
}

pub fn purple(input: &str) -> String {
    format!("{}{}{}", PURPLE, input, END)
}

pub fn cyan(input: &str) -> String {
    format!("{}{}{}", CYAN, input, END)
}

pub fn white(input: &str) -> String {
    format!("{}{}{}", WHITE, input, END)
}
