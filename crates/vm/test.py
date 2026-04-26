# Interpreter mit echten Scopes (Stack-basiert)

import re

class ReturnSignal(Exception):
    def __init__(self, value):
        self.value = value

class Interpreter:
    def __init__(self):
        self.scopes = [{}]  # Stack von Scopes
        self.functions = {}

    # ===== Scope Helpers =====
    def push_scope(self):
        self.scopes.append({})

    def pop_scope(self):
        self.scopes.pop()

    def set_var(self, name, value):
        self.scopes[-1][name] = value

    def get_var(self, name):
        for scope in reversed(self.scopes):
            if name in scope:
                return scope[name]
        raise Exception(f"Variable nicht gefunden: {name}")

    def current_env(self):
        env = {}
        for scope in self.scopes:
            env.update(scope)
        return env

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
        self.push_scope()
        i = 0

        try:
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
        finally:
            self.pop_scope()

    # ===== Variables =====
    def handle_variable(self, line):
        match = re.match(r"let (\w+) = (.+)", line)
        if match:
            name, value = match.groups()
            self.set_var(name, self.parse_value(value))

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

            self.push_scope()
            for p, a in zip(params, args):
                self.set_var(p, a)

            try:
                self.exec_block(body)
            except ReturnSignal as r:
                self.pop_scope()
                return r.value

            self.pop_scope()
        else:
            print(f"Unbekannte Funktion: {name}")

    # ===== Values =====
    def parse_value(self, value):
        value = value.strip()

        if value.startswith('"') and value.endswith('"'):
            return value[1:-1]
        elif value.isdigit():
            return int(value)
        else:
            try:
                return self.get_var(value)
            except:
                return self.eval_expression(value)

    def eval_expression(self, expr):
        try:
            return eval(expr, {}, self.current_env())
        except Exception:
            return False


# ===== Beispiel =====
code = """
let x = 100

fn test() {
    let x = 5
    print x
}

test()
print x

fn loop() {
    let i = 0
    while i < 3 {
        let i = i + 1
        print i
    }
}

loop()
"""

interpreter = Interpreter()
interpreter.eval(code)
