# Einfacher Interpreter mit Variablen, Funktionen und String-Handling

import re

class Interpreter:
    def __init__(self):
        self.variables = {}
        self.functions = {}

    def eval(self, code):
        lines = code.strip().split("\n")
        for line in lines:
            self.execute(line.strip())

    def execute(self, line):
        if len(line) == 0:
            pass
        elif line.startswith("let "):
            self.handle_variable(line)
        elif line.startswith("print "):
            self.handle_print(line)
        elif line.startswith("fn "):
            self.handle_function(line)
        elif "(" in line and line.endswith(")"):
            self.call_function(line)
        else:
            print(f"Unbekannter Befehl: {line}")

    def handle_variable(self, line):
        # let x = 5
        match = re.match(r"let (\w+) = (.+)", line)
        if match:
            name, value = match.groups()
            self.variables[name] = self.parse_value(value)

    def handle_print(self, line):
        expr = line[6:]
        value = self.parse_value(expr)
        print(value)

    def handle_function(self, line):
        # fn add(a, b) = a + b
        match = re.match(r"fn (\w+)\((.*?)\) = (.+)", line)
        if match:
            name, params, body = match.groups()
            params = [p.strip() for p in params.split(",") if p.strip()]
            self.functions[name] = (params, body)

    def call_function(self, line):
        match = re.match(r"(\w+)\((.*?)\)", line)
        if match:
            name, args = match.groups()
            args = [self.parse_value(a.strip()) for a in args.split(",") if a.strip()]

            if name in self.functions:
                params, body = self.functions[name]
                local_vars = dict(zip(params, args))
                result = self.eval_expression(body, local_vars)
                print(result)

    def parse_value(self, value):
        value = value.strip()

        if value.startswith('"') and value.endswith('"'):
            return value[1:-1]
        elif value.isdigit():
            return int(value)
        elif value in self.variables:
            return self.variables[value]
        else:
            return self.eval_expression(value, self.variables)

    def eval_expression(self, expr, scope):
        try:
            return eval(expr, {}, scope)
        except Exception as e:
            return f"Fehler in Ausdruck: {expr}"


# Beispiel
code = """
let x = 10
let y = 20
print x
print y

fn add(a, b) = a + b
add(5, 7)

let name = "Hallo Welt"
print name
"""

interpreter = Interpreter()
interpreter.eval(code)
