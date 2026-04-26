# Interpreter mit Funktionsblöcken, return, if und while

import re

class ReturnSignal(Exception):
    def __init__(self, value):
        self.value = value

class Interpreter:
    def __init__(self):
        self.variables = {}
        self.functions = {}

    # ===== Runner =====
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

    # ===== Statements =====
    def execute(self, line):
        if not line:
            return

        if line.startswith("let "):
            self.handle_variable(line)
        elif line.startswith("print"):
            self.handle_print(line)
        elif line.startswith("return "):
            value = self.parse_value(line[len("return "):])
            raise ReturnSignal(value)
        elif line.startswith("if "):
            raise Exception("'if' darf nur im Block verarbeitet werden")
        elif line.startswith("while "):
            raise Exception("'while' darf nur im Block verarbeitet werden")
        elif "(" in line and line.endswith(")"):
            self.call_function(line)
        else:
            print(f"Unbekannter Befehl: {line}")

    # ===== Blocks =====
    def collect_block(self, lines, start_index):
        body = []
        i = start_index
        depth = 0

        while i < len(lines):
            line = lines[i].strip()

            if line.endswith("{"):
                depth += 1
            if line == "}":
                if depth == 0:
                    break
                depth -= 1
                body.append(line)
            else:
                body.append(line)
            i += 1

        return body, i

    def exec_block(self, body):
        i = 0
        while i < len(body):
            line = body[i].strip()

            # IF
            if line.startswith("if ") and line.endswith("{"):
                cond = line[3:-1].strip()
                block, end = self.collect_block(body, i + 1)
                if self.eval_expression(cond):
                    self.exec_block(block)
                i = end

            # WHILE
            elif line.startswith("while ") and line.endswith("{"):
                cond = line[6:-1].strip()
                block, end = self.collect_block(body, i + 1)
                while self.eval_expression(cond):
                    self.exec_block(block)
                i = end

            else:
                self.execute(line)

            i += 1

    # ===== Variables =====
    def handle_variable(self, line):
        match = re.match(r"let (\w+) = (.+)", line)
        if match:
            name, value = match.groups()
            self.variables[name] = self.parse_value(value)

    # ===== Print =====
    def handle_print(self, line):
        parts = line.split(" ", 1)
        if len(parts) == 1:
            print()
        else:
            value = self.parse_value(parts[1])
            print(value)

    # ===== Functions =====
    def handle_function_block(self, lines, start_index):
        header = lines[start_index].strip()
        match = re.match(r"fn (\w+)\((.*?)\) \{", header)
        if not match:
            return start_index

        name, params = match.groups()
        params = [p.strip() for p in params.split(",") if p.strip()]

        body, end_index = self.collect_block(lines, start_index + 1)
        self.functions[name] = (params, body)

        return end_index

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

            try:
                self.exec_block(body)
            except ReturnSignal as r:
                self.variables = old_vars
                return r.value

            self.variables = old_vars
        else:
            print(f"Unbekannte Funktion: {name}")

    # ===== Values =====
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
            return False


# ===== Beispiel =====
code = """
let x = 0

fn count(n) {
    let i = 0
    while i < n {
        print i
        let i = i + 1
    }
}

fn add(a, b) {
    return a + b
}

count(5)
print add(3, 4)

fn test(v) {
    if v > 5 {
        print "groesser"
    }
}

test(10)
"""

interpreter = Interpreter()
interpreter.eval(code)
