enum Instruction {
    Add(String, String),
    // Print(String),
    // Concat(String, String, String), // key = a + b
}

struct Lang {
    code: String,
    instructions: Vec<Instruction>,
}

impl Lang {
    fn new(code: &str) -> Self {
        Self {
            code: code.to_string(),
            instructions: vec![],
        }
    }

    fn add(mut self, key: &str, value: &str) -> Self {
        self.instructions.push(
            Instruction::Add(key.to_string(), value.to_string())
        );
        self
    }
}

fn lang(code: &str) -> Lang {
    Lang::new(code)
}

use std::collections::HashMap;

struct VM {
    storage: HashMap<String, String>,
}

impl VM {
    fn new() -> Self {
        Self {
            storage: HashMap::new(),
        }
    }

    fn load(&mut self, lang: Lang) {
        for instr in lang.instructions {
            self.execute(instr);
        }
    }

    fn execute(&mut self, instr: Instruction) {
        match instr {
            Instruction::Add(k, v) => {
                self.storage.insert(k, v);
            }
        }
    }

    fn call(&self, key: &str) {
        match self.storage.get(key) {
            Some(val) => println!("{}", val),
            None => println!("Not found"),
        }
    }
}

fn main() {
    let de = lang("de_de")
        .add("hello", "Hallo")
        .add("bye", "Tschüss");

    let mut vm = VM::new();
    vm.load(de);

    vm.call("hello");
}
