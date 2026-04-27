// jsonc-parser.ts
// JSON with comments (// and /* */) parser in TypeScript

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export function parseJSONC(input: string): JSONValue {
  let i = 0;

  function error(msg: string): never {
    throw new SyntaxError(`${msg} at position ${i}`);
  }

  function peek(offset = 0) {
    return input[i + offset];
  }

  function consume() {
    return input[i++];
  }

  function skipWhitespaceAndComments() {
    while (i < input.length) {
      // whitespace
      if (/\s/.test(peek())) {
        i++;
        continue;
      }

      // line comment //
      if (peek() === '/' && peek(1) === '/') {
        i += 2;
        while (i < input.length && peek() !== '\n') i++;
        continue;
      }

      // block comment /* */
      if (peek() === '/' && peek(1) === '*') {
        i += 2;
        while (i < input.length && !(peek() === '*' && peek(1) === '/')) {
          i++;
        }
        if (i >= input.length) error("Unterminated block comment");
        i += 2;
        continue;
      }

      break;
    }
  }

  function parseValue(): JSONValue {
    skipWhitespaceAndComments();
    const ch = peek();

    if (ch === '"') return parseString();
    if (ch === '{') return parseObject();
    if (ch === '[') return parseArray();
    if (ch === '-' || /[0-9]/.test(ch)) return parseNumber();

    if (input.startsWith("true", i)) {
      i += 4;
      return true;
    }
    if (input.startsWith("false", i)) {
      i += 5;
      return false;
    }
    if (input.startsWith("null", i)) {
      i += 4;
      return null;
    }

    error("Unexpected token");
  }

  function parseString(): string {
    consume(); // "
    let result = "";

    while (i < input.length) {
      const ch = consume();
      if (ch === '"') return result;
      if (ch === '\\') {
        const next = consume();
        if (next === 'n') result += '\n';
        else if (next === 't') result += '\t';
        else if (next === 'r') result += '\r';
        else result += next;
      } else {
        result += ch;
      }
    }
    error("Unterminated string");
  }

  function parseNumber(): number {
    let num = "";
    while (/[-+0-9.eE]/.test(peek())) {
      num += consume();
    }
    const value = Number(num);
    if (Number.isNaN(value)) error("Invalid number");
    return value;
  }

  function parseArray(): JSONValue[] {
    consume(); // [
    const arr: JSONValue[] = [];

    skipWhitespaceAndComments();
    if (peek() === ']') {
      consume();
      return arr;
    }

    while (true) {
      arr.push(parseValue());
      skipWhitespaceAndComments();

      const ch = consume();
      if (ch === ']') break;
      if (ch !== ',') error("Expected ',' or ']'");

      skipWhitespaceAndComments();
      if (peek() === ']') {
        consume();
        break;
      }
    }

    return arr;
  }

  function parseObject(): { [key: string]: JSONValue } {
    consume(); // {
    const obj: any = {};

    skipWhitespaceAndComments();
    if (peek() === '}') {
      consume();
      return obj;
    }

    while (true) {
      skipWhitespaceAndComments();
      const key = parseKey();

      skipWhitespaceAndComments();
      if (consume() !== ':') error("Expected ':'");

      const value = parseValue();
      obj[key] = value;

      skipWhitespaceAndComments();
      const ch = consume();
      if (ch === '}') break;
      if (ch !== ',') error("Expected ',' or '}'");

      skipWhitespaceAndComments();
      if (peek() === '}') {
        consume();
        break;
      }
    }

    return obj;
  }

  function parseKey(): string {
    skipWhitespaceAndComments();
    if (peek() === '"') return parseString();
    error("Keys must be strings in JSONC");
  }

  const result = parseValue();
  skipWhitespaceAndComments();
  if (i < input.length) error("Unexpected trailing input");

  return result;
}
