use std::fs;

mod consts;
mod data;
mod settings;

use crate::{consts::PACKAGE_FILE, data::load_index, settings::load_settings};

fn main() -> anyhow::Result<()> {
    // let content = fs::read_to_string(PACKAGE_FILE)?;

    // println!("{content}");

    let f = load_settings().unwrap();
    println!("{}, {}", f.cache_size, f.repo_url);

    let l = load_index().unwrap();
    for x in l.package {
        println!("{}", x.name)
    }

    Ok(())
}