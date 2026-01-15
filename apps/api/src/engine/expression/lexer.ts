import type { Token, TokenType } from "./types";

/**
 * Lexer for expression strings
 *
 * Tokenizes expressions like:
 *   character.$player.stats.gold += 100
 *   $self.status = available when character.$player.stats.level >= 5
 *   moment.tavern_fight-*.status = passed
 */
export class Lexer {
  private input: string;
  private position: number = 0;
  private tokens: Token[] = [];

  private static readonly KEYWORDS = new Set(["when", "ai", "true", "false"]);

  private static readonly OPERATORS: Record<string, TokenType> = {
    "+": "OPERATOR",
    "-": "OPERATOR",
    "*": "OPERATOR",
    "/": "OPERATOR",
    "%": "OPERATOR",
    "=": "ASSIGN_OP",
    "+=": "ASSIGN_OP",
    "-=": "ASSIGN_OP",
    "*=": "ASSIGN_OP",
    "/=": "ASSIGN_OP",
    "==": "COMPARE_OP",
    "!=": "COMPARE_OP",
    "<": "COMPARE_OP",
    ">": "COMPARE_OP",
    "<=": "COMPARE_OP",
    ">=": "COMPARE_OP",
    "&&": "LOGIC_OP",
    "||": "LOGIC_OP",
    "!": "OPERATOR",
  };

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;

    while (this.position < this.input.length) {
      this.skipWhitespace();
      if (this.position >= this.input.length) break;

      const token = this.readNextToken();
      if (token) {
        this.tokens.push(token);
      }
    }

    this.tokens.push({ type: "EOF", value: "", position: this.position });
    return this.tokens;
  }

  private skipWhitespace(): void {
    while (
      this.position < this.input.length &&
      /\s/.test(this.input[this.position])
    ) {
      this.position++;
    }
  }

  private readNextToken(): Token | null {
    const char = this.input[this.position];
    const startPos = this.position;

    // Parentheses
    if (char === "(") {
      this.position++;
      return { type: "PAREN_OPEN", value: "(", position: startPos };
    }
    if (char === ")") {
      this.position++;
      return { type: "PAREN_CLOSE", value: ")", position: startPos };
    }

    // Comma
    if (char === ",") {
      this.position++;
      return { type: "COMMA", value: ",", position: startPos };
    }

    // Dot
    if (char === ".") {
      this.position++;
      return { type: "DOT", value: ".", position: startPos };
    }

    // String literals
    if (char === '"' || char === "'") {
      return this.readString(char);
    }

    // Numbers
    if (/[0-9]/.test(char) || (char === "-" && this.isNumberAhead())) {
      return this.readNumber();
    }

    // Operators (check multi-char first)
    const twoChar = this.input.slice(this.position, this.position + 2);
    if (Lexer.OPERATORS[twoChar]) {
      this.position += 2;
      return {
        type: Lexer.OPERATORS[twoChar],
        value: twoChar,
        position: startPos,
      };
    }

    if (Lexer.OPERATORS[char]) {
      this.position++;
      return { type: Lexer.OPERATORS[char], value: char, position: startPos };
    }

    // Wildcard (standalone *)
    if (char === "*" && this.isWildcardContext()) {
      this.position++;
      return { type: "WILDCARD", value: "*", position: startPos };
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(char)) {
      return this.readIdentifier();
    }

    // Unknown character - skip
    this.position++;
    return null;
  }

  private readString(quote: string): Token {
    const startPos = this.position;
    this.position++; // skip opening quote
    let value = "";

    while (this.position < this.input.length) {
      const char = this.input[this.position];
      if (char === quote) {
        this.position++; // skip closing quote
        break;
      }
      if (char === "\\") {
        this.position++;
        if (this.position < this.input.length) {
          value += this.input[this.position];
          this.position++;
        }
      } else {
        value += char;
        this.position++;
      }
    }

    return { type: "STRING", value, position: startPos };
  }

  private readNumber(): Token {
    const startPos = this.position;
    let value = "";

    // Handle negative sign
    if (this.input[this.position] === "-") {
      value += "-";
      this.position++;
    }

    // Read digits
    while (
      this.position < this.input.length &&
      /[0-9]/.test(this.input[this.position])
    ) {
      value += this.input[this.position];
      this.position++;
    }

    // Read decimal part
    if (
      this.position < this.input.length &&
      this.input[this.position] === "."
    ) {
      const nextChar = this.input[this.position + 1];
      if (nextChar && /[0-9]/.test(nextChar)) {
        value += ".";
        this.position++;
        while (
          this.position < this.input.length &&
          /[0-9]/.test(this.input[this.position])
        ) {
          value += this.input[this.position];
          this.position++;
        }
      }
    }

    return { type: "NUMBER", value, position: startPos };
  }

  private readIdentifier(): Token {
    const startPos = this.position;
    let value = "";

    // Allow $, letters, digits, underscores, and hyphens (for moment IDs like tavern_fight-0)
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      if (/[a-zA-Z0-9_$-]/.test(char)) {
        value += char;
        this.position++;
      } else {
        break;
      }
    }

    // Check for keywords
    const lowerValue = value.toLowerCase();
    if (lowerValue === "true") {
      return { type: "BOOLEAN", value: "true", position: startPos };
    }
    if (lowerValue === "false") {
      return { type: "BOOLEAN", value: "false", position: startPos };
    }
    if (Lexer.KEYWORDS.has(lowerValue)) {
      return { type: "KEYWORD", value: lowerValue, position: startPos };
    }

    return { type: "IDENTIFIER", value, position: startPos };
  }

  private isNumberAhead(): boolean {
    // Check if after '-' there's a digit (negative number vs subtraction)
    const nextPos = this.position + 1;
    if (nextPos >= this.input.length) return false;

    const nextChar = this.input[nextPos];
    if (!/[0-9]/.test(nextChar)) return false;

    // It's a negative number if preceded by operator/start/open-paren
    const prevToken = this.tokens[this.tokens.length - 1];
    if (!prevToken) return true;

    return (
      prevToken.type === "OPERATOR" ||
      prevToken.type === "ASSIGN_OP" ||
      prevToken.type === "COMPARE_OP" ||
      prevToken.type === "LOGIC_OP" ||
      prevToken.type === "PAREN_OPEN" ||
      prevToken.type === "COMMA"
    );
  }

  private isWildcardContext(): boolean {
    // * is a wildcard if it follows a hyphen (moment.tavern_fight-*)
    const prevToken = this.tokens[this.tokens.length - 1];
    if (!prevToken) return false;

    // Check if previous identifier ends with hyphen
    if (prevToken.type === "IDENTIFIER" && prevToken.value.endsWith("-")) {
      return true;
    }

    // Check if we just processed a hyphen as part of identifier
    // Actually the hyphen will be part of the identifier, so check if
    // the previous character in the input before position is a hyphen
    const prevChar = this.input[this.position - 1];
    return prevChar === "-";
  }
}

/**
 * Convenience function to tokenize an expression
 */
export function tokenize(input: string): Token[] {
  return new Lexer(input).tokenize();
}
