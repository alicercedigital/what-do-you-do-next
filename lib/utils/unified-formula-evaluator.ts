import type { ConflictRole } from "@/lib/schemas/conflict-event-schema";
import type { GameAttribute, UniversalFormulaToken } from "@/lib/schemas/game-entity-schema";

/**
 * Context for formula evaluation
 * Supports both basic attributes and role-based conflict formulas
 */
export interface FormulaContext {
  // Basic attributes (for simple formulas)
  attributeValues?: Record<string, number>;

  // Role-based attributes (for conflict formulas)
  roles?: Record<string, Record<string, number>>;

  // Temporary variables
  variables?: Record<string, number | string | boolean>;

  // Current role context (for "self" references)
  currentRoleId?: string;
}

/**
 * Token-based formula evaluator that safely executes math without eval/new Function
 * Uses a stack-based approach (RPN) to handle operator precedence
 */
export class UnifiedFormulaEvaluator {
  /**
   * Evaluate a formula token array and return the result
   */
  static evaluate(
    tokens: UniversalFormulaToken[],
    context: FormulaContext
  ): number | boolean | string {
    if (tokens.length === 0) return 0;

    // Convert tokens to RPN (Reverse Polish Notation) for safe evaluation
    const rpn = this.convertToRPN(tokens);

    // Evaluate RPN
    return this.evaluateRPN(rpn, context);
  }

  /**
   * Convert infix tokens to RPN using Shunting-yard algorithm
   */
  private static convertToRPN(
    tokens: UniversalFormulaToken[]
  ): UniversalFormulaToken[] {
    const output: UniversalFormulaToken[] = [];
    const operatorStack: UniversalFormulaToken[] = [];

    // Operator precedence
    const precedence: Record<string, number> = {
      "(": 0,
      ")": 0,
      or: 1,
      and: 2,
      "=": 3,
      "!=": 3,
      "<": 3,
      ">": 3,
      "<=": 3,
      ">=": 3,
      "+": 4,
      "-": 4,
      "*": 5,
      "/": 5,
      function: 6,
    };

    const isOperator = (type: string) =>
      type === "operator" || type === "comparison" || type === "logical";

    const getPrecedence = (token: UniversalFormulaToken): number => {
      if (token.type === "function") return 6;
      if (token.type === "parenthesis") {
        return token.value === "(" ? 0 : 0;
      }
      return precedence[token.value] || 0;
    };

    for (const token of tokens) {
      if (
        token.type === "number" ||
        token.type === "attribute" ||
        token.type === "role-attribute" ||
        token.type === "string"
      ) {
        output.push(token);
      } else if (token.type === "function") {
        operatorStack.push(token);
      } else if (token.type === "parenthesis") {
        if (token.value === "(") {
          operatorStack.push(token);
        } else {
          // Pop until matching '('
          while (operatorStack.length > 0) {
            const top = operatorStack[operatorStack.length - 1];
            if (top.type === "parenthesis" && top.value === "(") {
              operatorStack.pop();
              break;
            }
            output.push(operatorStack.pop()!);
          }
          // If there's a function on the stack, pop it too
          if (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1].type === "function"
          ) {
            output.push(operatorStack.pop()!);
          }
        }
      } else if (isOperator(token.type)) {
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (
            isOperator(top.type) &&
            getPrecedence(top) >= getPrecedence(token)
          ) {
            output.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(token);
      }
    }

    // Pop remaining operators
    while (operatorStack.length > 0) {
      output.push(operatorStack.pop()!);
    }

    return output;
  }

  /**
   * Evaluate RPN tokens safely
   */
  private static evaluateRPN(
    rpn: UniversalFormulaToken[],
    context: FormulaContext
  ): number | boolean | string {
    const stack: (number | boolean | string)[] = [];

    for (const token of rpn) {
      switch (token.type) {
        case "number":
          stack.push(Number.parseFloat(token.value) || 0);
          break;

        case "attribute": {
          const value = context.attributeValues?.[token.value] ?? 0;
          stack.push(value);
          break;
        }

        case "role-attribute": {
          const [roleId, attributeId] = token.value.split(".");
          const value = context.roles?.[roleId]?.[attributeId] ?? 0;
          stack.push(value);
          break;
        }

        case "string":
          stack.push(token.value);
          break;

        case "operator": {
          const right = stack.pop() as number;
          const left = stack.pop() as number;
          let result: number;

          switch (token.value) {
            case "+":
              result = left + right;
              break;
            case "-":
              result = left - right;
              break;
            case "*":
              result = left * right;
              break;
            case "/":
              result = right !== 0 ? left / right : 0;
              break;
            default:
              result = 0;
          }
          stack.push(result);
          break;
        }

        case "comparison": {
          const right = stack.pop() as number;
          const left = stack.pop() as number;
          let result: boolean;

          switch (token.value) {
            case "=":
              result = left === right;
              break;
            case "!=":
              result = left !== right;
              break;
            case "<":
              result = left < right;
              break;
            case ">":
              result = left > right;
              break;
            case "<=":
              result = left <= right;
              break;
            case ">=":
              result = left >= right;
              break;
            default:
              result = false;
          }
          stack.push(result);
          break;
        }

        case "logical": {
          const right = stack.pop() as boolean;
          const left = stack.pop() as boolean;
          let result: boolean;

          switch (token.value) {
            case "and":
              result = left && right;
              break;
            case "or":
              result = left || right;
              break;
            case "not":
              result = !right;
              stack.push(left);
              break; // 'not' is unary
            default:
              result = false;
          }
          stack.push(result);
          break;
        }

        case "function": {
          const funcName = token.value.toLowerCase();

          if (funcName === "random") {
            stack.push(Math.random());
          } else if (funcName === "floor") {
            const value = stack.pop() as number;
            stack.push(Math.floor(value));
          } else if (funcName === "ceil") {
            const value = stack.pop() as number;
            stack.push(Math.ceil(value));
          } else if (funcName === "round") {
            const value = stack.pop() as number;
            stack.push(Math.round(value));
          } else if (funcName === "max") {
            const right = stack.pop() as number;
            const left = stack.pop() as number;
            stack.push(Math.max(left, right));
          } else if (funcName === "min") {
            const right = stack.pop() as number;
            const left = stack.pop() as number;
            stack.push(Math.min(left, right));
          } else if (funcName === "abs") {
            const value = stack.pop() as number;
            stack.push(Math.abs(value));
          } else if (funcName.startsWith("d")) {
            // Dice roll: d6, d20, etc.
            const sides = Number.parseInt(funcName.substring(1)) || 20;
            const roll = Math.floor(Math.random() * sides) + 1;
            stack.push(roll);
          }
          break;
        }

        case "parenthesis":
          // Should not reach here in valid RPN
          break;
      }
    }

    return stack.length > 0 ? stack[stack.length - 1] : 0;
  }

  /**
   * Validate a formula structure
   */
  static validate(
    tokens: UniversalFormulaToken[],
    availableAttributes: string[],
    availableRoles?: ConflictRole[]
  ): { valid: boolean; error?: string } {
    if (tokens.length === 0) return { valid: true };

    // Check parentheses balance
    let parenCount = 0;
    for (const token of tokens) {
      if (token.type === "parenthesis") {
        if (token.value === "(") parenCount++;
        else if (token.value === ")") parenCount--;

        if (parenCount < 0) {
          return { valid: false, error: "Unbalanced parentheses" };
        }
      }
    }
    if (parenCount !== 0) {
      return { valid: false, error: "Unbalanced parentheses" };
    }

    // Check that all references are valid
    const attrSet = new Set(availableAttributes);
    const roleSet = new Set(availableRoles?.map((r) => r.id) || []);

    for (const token of tokens) {
      if (token.type === "attribute" && !attrSet.has(token.value)) {
        return { valid: false, error: `Unknown attribute: ${token.value}` };
      }

      if (token.type === "role-attribute") {
        const [roleId, attributeId] = token.value.split(".");
        if (!roleSet.has(roleId)) {
          return { valid: false, error: `Unknown role: ${roleId}` };
        }
        if (!attrSet.has(attributeId)) {
          return { valid: false, error: `Unknown attribute: ${attributeId}` };
        }
      }
    }

    // Try to evaluate with dummy values to catch syntax errors
    try {
      const dummyContext: FormulaContext = {
        attributeValues: Object.fromEntries(
          availableAttributes.map((id) => [id, 1])
        ),
        roles: availableRoles
          ? Object.fromEntries(
              availableRoles.map((r) => [
                r.id,
                Object.fromEntries(availableAttributes.map((id) => [id, 1])),
              ])
            )
          : {},
        variables: {},
      };
      this.evaluate(tokens, dummyContext);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Invalid formula syntax" };
    }
  }

  /**
   * Convert tokens to human-readable string
   */
  static toString(
    tokens: UniversalFormulaToken[],
    attributes: GameAttribute[],
    roles?: ConflictRole[]
  ): string {
    const attrMap = new Map(
      attributes.map((a) => [a.id, a.shortName || a.name])
    );
    const roleMap = new Map(roles?.map((r) => [r.id, r.name]) || []);

    return tokens
      .map((token) => {
        switch (token.type) {
          case "attribute":
            return attrMap.get(token.value) || token.value;

          case "role-attribute": {
            const [roleId, attributeId] = token.value.split(".");
            const roleName = roleMap.get(roleId) || roleId;
            const attrName = attrMap.get(attributeId) || attributeId;
            return `${roleName}.${attrName}`;
          }

          case "logical":
            return token.value.toUpperCase();

          default:
            return token.value;
        }
      })
      .join(" ");
  }
}
