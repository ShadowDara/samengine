# Erweiterter Interpreter mit Funktionsblöcken { }

import re

class Interpreter:
    def __init__(self):
        self.variables = {}
        self.functions = {}

    def eval(self, code):
        lines = code.strip().split("\n")
        i = 0
        while i < len(lines):
            line = lines[i].strip()

            if line.startswith("fn "):
                i = self.handle_function_block(lines, i)
            else:
                self.execute(line)
            i += 1

    def execute(self, line):
        if not line:
            return
        if line.startswith("let "):
            self.handle_variable(line)
        elif line.startswith("print"):
            self.handle_print(line)
        elif "(" in line and line.endswith(")"):
            self.call_function(line)
        else:
            print(f"Unbekannter Befehl: {line}")

    def handle_variable(self, line):
        match = re.match(r"let (\w+) = (.+)", line)
        if match:
            name, value = match.groups()
            self.variables[name] = self.parse_value(value)

    def handle_print(self, line):
        parts = line.split(" ", 1)
        if len(parts) == 1:
            print()
        else:
            value = self.parse_value(parts[1])
            print(value)

    def handle_function_block(self, lines, start_index):
        header = lines[start_index].strip()
        match = re.match(r"fn (\w+)\((.*?)\) \{", header)
        if not match:
            return start_index

        name, params = match.groups()
        params = [p.strip() for p in params.split(",") if p.strip()]

        body = []
        i = start_index + 1

        while i < len(lines):
            line = lines[i].strip()
            if line == "}":
                break
            body.append(line)
            i += 1

        self.functions[name] = (params, body)
        return i

    def call_function(self, line):
        match = re.match(r"(\w+)\((.*?)\)", line)
        if not match:
            return

        name, args = match.groups()
        args = [self.parse_value(a.strip()) for a in args.split(",") if a.strip()]

        if name in self.functions:
            params, body = self.functions[name]
            local_vars = dict(zip(params, args))

            old_vars = self.variables.copy()
            self.variables.update(local_vars)

            for stmt in body:
                self.execute(stmt)

            self.variables = old_vars
        else:
            print(f"Unbekannte Funktion: {name}")

    def parse_value(self, value):
        value = value.strip()

        if value.startswith('"') and value.endswith('"'):
            return value[1:-1]
        elif value.isdigit():
            return int(value)
        elif value in self.variables:
            return self.variables[value]
        else:
            return self.eval_expression(value)

    def eval_expression(self, expr):
        try:
            return eval(expr, {}, self.variables)
        except Exception:
            return f"Fehler in Ausdruck: {expr}"


# Beispiel
code = """
let x = 10

fn add(a, b) {
    print a
    print b
}

add(3, 7)

fn greet(name) {
    print "Hallo"
    print name
}

greet("Max")

"""

interpreter = Interpreter()
interpreter.eval(code)
