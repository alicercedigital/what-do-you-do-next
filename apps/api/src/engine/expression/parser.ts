import { tokenize } from "./lexer";
import type {
  ASTNode,
  AssignmentNode,
  ConditionalNode,
  PathNode,
  Token,
  AiConditionNode,
} from "./types";

/**
 * Recursive descent parser for expressions
 *
 * Grammar (simplified):
 *   expression     -> conditional
 *   conditional    -> assignment ("when" condition)?
 *   condition      -> "ai" "(" string ")" | logicOr
 *   assignment     -> logicOr (assignOp logicOr)?
 *   logicOr        -> logicAnd ("||" logicAnd)*
 *   logicAnd       -> comparison ("&&" comparison)*
 *   comparison     -> term (compareOp term)?
 *   term           -> factor (("+"|"-") factor)*
 *   factor         -> unary (("*"|"/"|"%") unary)*
 *   unary          -> ("!"|"-") unary | primary
 *   primary        -> number | string | boolean | path | functionCall | "(" expression ")"
 *   path           -> identifier ("." identifier)*
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ASTNode {
    const expr = this.expression();

    if (!this.isAtEnd() && this.peek().type !== "EOF") {
      throw new Error(
        `Unexpected token at position ${this.peek().position}: ${this.peek().value}`
      );
    }

    return expr;
  }

  private expression(): ASTNode {
    return this.conditional();
  }

  private conditional(): ASTNode {
    const expr = this.assignment();

    // Check for "when" keyword
    if (this.check("KEYWORD") && this.peek().value === "when") {
      this.advance(); // consume "when"

      let condition: ASTNode | AiConditionNode;

      // Check for ai() condition
      if (this.check("KEYWORD") && this.peek().value === "ai") {
        this.advance(); // consume "ai"
        this.consume("PAREN_OPEN", "Expected '(' after 'ai'");

        // Read everything until closing paren as the hint
        const hint = this.readAiHint();

        this.consume("PAREN_CLOSE", "Expected ')' after ai hint");

        condition = { type: "ai_condition", hint } as AiConditionNode;
      } else {
        condition = this.logicOr();
      }

      return {
        type: "conditional",
        expression: expr,
        condition,
      } as ConditionalNode;
    }

    return expr;
  }

  private readAiHint(): string {
    // Read all tokens until we find the closing paren, reconstructing as string
    let hint = "";
    let parenDepth = 1;

    while (!this.isAtEnd() && parenDepth > 0) {
      const token = this.peek();

      if (token.type === "PAREN_OPEN") {
        parenDepth++;
        hint += "(";
        this.advance();
      } else if (token.type === "PAREN_CLOSE") {
        parenDepth--;
        if (parenDepth > 0) {
          hint += ")";
          this.advance();
        }
        // Don't advance if parenDepth is 0, let the caller consume it
      } else {
        hint += token.value + " ";
        this.advance();
      }
    }

    return hint.trim();
  }

  private assignment(): ASTNode {
    const expr = this.logicOr();

    // Check for assignment operator
    if (this.check("ASSIGN_OP")) {
      const operator = this.advance().value;
      const value = this.logicOr();

      // Target must be a path
      if (expr.type !== "path") {
        throw new Error("Invalid assignment target - must be a path");
      }

      return {
        type: "assignment",
        target: expr as PathNode,
        operator,
        value,
      } as AssignmentNode;
    }

    return expr;
  }

  private logicOr(): ASTNode {
    let left = this.logicAnd();

    while (this.check("LOGIC_OP") && this.peek().value === "||") {
      const operator = this.advance().value;
      const right = this.logicAnd();
      left = { type: "binary", operator, left, right };
    }

    return left;
  }

  private logicAnd(): ASTNode {
    let left = this.comparison();

    while (this.check("LOGIC_OP") && this.peek().value === "&&") {
      const operator = this.advance().value;
      const right = this.comparison();
      left = { type: "binary", operator, left, right };
    }

    return left;
  }

  private comparison(): ASTNode {
    let left = this.term();

    if (this.check("COMPARE_OP")) {
      const operator = this.advance().value;
      const right = this.term();
      left = { type: "binary", operator, left, right };
    }

    return left;
  }

  private term(): ASTNode {
    let left = this.factor();

    while (this.check("OPERATOR") && ["+", "-"].includes(this.peek().value)) {
      const operator = this.advance().value;
      const right = this.factor();
      left = { type: "binary", operator, left, right };
    }

    return left;
  }

  private factor(): ASTNode {
    let left = this.unary();

    while (
      this.check("OPERATOR") &&
      ["*", "/", "%"].includes(this.peek().value)
    ) {
      const operator = this.advance().value;
      const right = this.unary();
      left = { type: "binary", operator, left, right };
    }

    return left;
  }

  private unary(): ASTNode {
    if (this.check("OPERATOR") && ["!", "-"].includes(this.peek().value)) {
      const operator = this.advance().value;
      const operand = this.unary();
      return { type: "unary", operator, operand };
    }

    return this.primary();
  }

  private primary(): ASTNode {
    const token = this.peek();

    // Number literal
    if (token.type === "NUMBER") {
      this.advance();
      return { type: "literal", value: parseFloat(token.value) };
    }

    // String literal
    if (token.type === "STRING") {
      this.advance();
      return { type: "literal", value: token.value };
    }

    // Boolean literal
    if (token.type === "BOOLEAN") {
      this.advance();
      return { type: "literal", value: token.value === "true" };
    }

    // Parenthesized expression
    if (token.type === "PAREN_OPEN") {
      this.advance();
      const expr = this.expression();
      this.consume("PAREN_CLOSE", "Expected ')' after expression");
      return expr;
    }

    // Identifier - could be path or function call
    if (token.type === "IDENTIFIER") {
      return this.pathOrFunction();
    }

    throw new Error(
      `Unexpected token at position ${token.position}: ${token.type} "${token.value}"`
    );
  }

  private pathOrFunction(): ASTNode {
    const segments: string[] = [];
    let hasWildcard = false;

    // Read first identifier
    segments.push(this.advance().value);

    // Check for wildcard after hyphen (moment.tavern_fight-*)
    if (this.check("WILDCARD")) {
      // The previous segment should end with a hyphen
      if (segments[segments.length - 1].endsWith("-")) {
        this.advance();
        hasWildcard = true;
        // Remove trailing hyphen and add wildcard marker
        segments[segments.length - 1] =
          segments[segments.length - 1].slice(0, -1) + "-*";
      }
    }

    // Check if it's a function call
    if (this.check("PAREN_OPEN") && !this.checkNext("DOT") && !hasWildcard) {
      // It's a function call
      const name = segments[0];
      this.advance(); // consume '('
      const args = this.functionArgs();
      this.consume("PAREN_CLOSE", "Expected ')' after function arguments");
      return { type: "function", name, args };
    }

    // Read path segments
    while (this.check("DOT")) {
      this.advance(); // consume '.'

      if (!this.check("IDENTIFIER") && !this.check("WILDCARD")) {
        throw new Error(`Expected identifier after '.' at position ${this.peek().position}`);
      }

      if (this.check("WILDCARD")) {
        // Standalone wildcard in path
        this.advance();
        segments.push("*");
        hasWildcard = true;
      } else {
        segments.push(this.advance().value);

        // Check for wildcard after hyphen
        if (this.check("WILDCARD")) {
          if (segments[segments.length - 1].endsWith("-")) {
            this.advance();
            hasWildcard = true;
            segments[segments.length - 1] =
              segments[segments.length - 1].slice(0, -1) + "-*";
          }
        }
      }
    }

    return { type: "path", segments, hasWildcard };
  }

  private functionArgs(): ASTNode[] {
    const args: ASTNode[] = [];

    if (!this.check("PAREN_CLOSE")) {
      args.push(this.expression());

      while (this.check("COMMA")) {
        this.advance(); // consume ','
        args.push(this.expression());
      }
    }

    return args;
  }

  // Helper methods

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  private check(type: Token["type"]): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkNext(type: Token["type"]): boolean {
    if (this.current + 1 >= this.tokens.length) return false;
    return this.tokens[this.current + 1].type === type;
  }

  private consume(type: Token["type"], message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new Error(`${message} at position ${this.peek().position}`);
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }
}

/**
 * Parse an expression string into an AST
 */
export function parse(input: string): ASTNode {
  const tokens = tokenize(input);
  return new Parser(tokens).parse();
}
