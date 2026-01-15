import { parse } from "./parser";
import { PathResolver, resolvePath, setPathValue } from "./resolver";
import type {
  ASTNode,
  EvaluationContext,
  EvaluationResult,
  Mutation,
  AiConditionRequest,
  PathNode,
  ResolvedPath,
} from "./types";

/**
 * Evaluates AST nodes against the game context
 */
export class Evaluator {
  private mutations: Mutation[] = [];
  private aiConditions: AiConditionRequest[] = [];
  private originalExpression: string;

  constructor(
    private context: EvaluationContext,
    expression: string = ""
  ) {
    this.originalExpression = expression;
  }

  evaluate(node: ASTNode): EvaluationResult {
    const value = this.evaluateNode(node);
    return {
      value,
      mutations: this.mutations,
      aiConditions: this.aiConditions,
    };
  }

  getContext(): EvaluationContext {
    return this.context;
  }

  private evaluateNode(node: ASTNode): unknown {
    switch (node.type) {
      case "literal":
        return node.value;

      case "path":
        return this.evaluatePath(node);

      case "unary":
        return this.evaluateUnary(node);

      case "binary":
        return this.evaluateBinary(node);

      case "assignment":
        return this.evaluateAssignment(node);

      case "conditional":
        return this.evaluateConditional(node);

      case "function":
        return this.evaluateFunction(node);

      case "ai_condition":
        // AI conditions are collected, not evaluated directly
        this.aiConditions.push({
          hint: node.hint,
          expression: this.originalExpression,
        });
        return false; // Default to false, will be evaluated by AI service

      default:
        throw new Error(`Unknown node type: ${(node as ASTNode).type}`);
    }
  }

  private evaluatePath(node: PathNode): unknown {
    const resolved = resolvePath(node, this.context);

    if (Array.isArray(resolved)) {
      // Wildcard path - return array of values
      return resolved.map((r) => r.value);
    }

    return resolved.value;
  }

  private evaluateUnary(node: { operator: string; operand: ASTNode }): unknown {
    const operand = this.evaluateNode(node.operand);

    switch (node.operator) {
      case "!":
        return !operand;
      case "-":
        return -(operand as number);
      default:
        throw new Error(`Unknown unary operator: ${node.operator}`);
    }
  }

  private evaluateBinary(node: {
    operator: string;
    left: ASTNode;
    right: ASTNode;
  }): unknown {
    // Short-circuit evaluation for logical operators
    if (node.operator === "&&") {
      const left = this.evaluateNode(node.left);
      if (!left) return false;
      return !!this.evaluateNode(node.right);
    }

    if (node.operator === "||") {
      const left = this.evaluateNode(node.left);
      if (left) return true;
      return !!this.evaluateNode(node.right);
    }

    const left = this.evaluateNode(node.left);
    const right = this.evaluateNode(node.right);

    switch (node.operator) {
      // Arithmetic
      case "+":
        if (typeof left === "string" || typeof right === "string") {
          return String(left) + String(right);
        }
        return (left as number) + (right as number);
      case "-":
        return (left as number) - (right as number);
      case "*":
        return (left as number) * (right as number);
      case "/":
        return (left as number) / (right as number);
      case "%":
        return (left as number) % (right as number);

      // Comparison
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return (left as number) < (right as number);
      case ">":
        return (left as number) > (right as number);
      case "<=":
        return (left as number) <= (right as number);
      case ">=":
        return (left as number) >= (right as number);

      default:
        throw new Error(`Unknown binary operator: ${node.operator}`);
    }
  }

  private evaluateAssignment(node: {
    target: PathNode;
    operator: string;
    value: ASTNode;
  }): unknown {
    const newValue = this.evaluateNode(node.value);
    let finalValue: unknown;

    if (node.operator === "=") {
      finalValue = newValue;
    } else {
      // Compound assignment - get current value first
      const currentResolved = resolvePath(node.target, this.context);
      const current = Array.isArray(currentResolved)
        ? (currentResolved[0]?.value as number) ?? 0
        : ((currentResolved as ResolvedPath).value as number) ?? 0;

      switch (node.operator) {
        case "+=":
          if (typeof current === "string" || typeof newValue === "string") {
            finalValue = String(current) + String(newValue);
          } else {
            finalValue = current + (newValue as number);
          }
          break;
        case "-=":
          finalValue = current - (newValue as number);
          break;
        case "*=":
          finalValue = current * (newValue as number);
          break;
        case "/=":
          finalValue = current / (newValue as number);
          break;
        default:
          throw new Error(`Unknown assignment operator: ${node.operator}`);
      }
    }

    // Apply the mutation
    this.context = setPathValue(node.target, finalValue, this.context);
    this.mutations.push({
      path: node.target.segments,
      value: finalValue,
    });

    return finalValue;
  }

  private evaluateConditional(node: {
    expression: ASTNode;
    condition: ASTNode;
  }): unknown {
    // Evaluate the condition
    const conditionResult = this.evaluateNode(node.condition);

    // If condition involves AI, we can't evaluate synchronously
    if (
      node.condition.type === "ai_condition" ||
      this.aiConditions.length > 0
    ) {
      // AI condition was collected during evaluation
      // Return undefined to indicate deferred evaluation
      return undefined;
    }

    // If condition is true, evaluate the expression
    if (conditionResult) {
      return this.evaluateNode(node.expression);
    }

    // Condition is false, expression is not executed
    return undefined;
  }

  private evaluateFunction(node: { name: string; args: ASTNode[] }): unknown {
    const args = node.args.map((arg) => this.evaluateNode(arg));

    switch (node.name.toLowerCase()) {
      case "min":
        return Math.min(...(args as number[]));

      case "max":
        return Math.max(...(args as number[]));

      case "floor":
        return Math.floor(args[0] as number);

      case "ceil":
        return Math.ceil(args[0] as number);

      case "abs":
        return Math.abs(args[0] as number);

      case "round":
        return Math.round(args[0] as number);

      case "roll":
        // Dice roll - format: roll("1d20") or roll(1, 20) for 1d20
        return this.evaluateRoll(args);

      case "clamp":
        // clamp(value, min, max)
        const [value, min, max] = args as number[];
        return Math.min(Math.max(value, min), max);

      case "random":
        // random() or random(min, max)
        if (args.length === 0) {
          return Math.random();
        }
        if (args.length === 2) {
          const [rmin, rmax] = args as number[];
          return Math.floor(Math.random() * (rmax - rmin + 1)) + rmin;
        }
        return Math.random();

      default:
        throw new Error(`Unknown function: ${node.name}`);
    }
  }

  private evaluateRoll(args: unknown[]): number {
    if (args.length === 1 && typeof args[0] === "string") {
      // Parse dice notation like "1d20", "2d6+3"
      const notation = args[0] as string;
      const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

      if (!match) {
        throw new Error(`Invalid dice notation: ${notation}`);
      }

      const count = parseInt(match[1], 10);
      const sides = parseInt(match[2], 10);
      const modifier = match[3] ? parseInt(match[3], 10) : 0;

      let total = 0;
      for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
      }

      return total + modifier;
    }

    if (args.length === 2) {
      // roll(count, sides)
      const count = args[0] as number;
      const sides = args[1] as number;

      let total = 0;
      for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
      }

      return total;
    }

    throw new Error("roll() requires dice notation string or (count, sides)");
  }
}

/**
 * Evaluate an expression string against a context
 */
export function evaluate(
  expression: string,
  context: EvaluationContext
): EvaluationResult {
  const ast = parse(expression);
  const evaluator = new Evaluator(context, expression);
  return evaluator.evaluate(ast);
}

/**
 * Evaluate an expression and return the modified context
 */
export function evaluateAndApply(
  expression: string,
  context: EvaluationContext
): { context: EvaluationContext; result: EvaluationResult } {
  const ast = parse(expression);
  const evaluator = new Evaluator(context, expression);
  const result = evaluator.evaluate(ast);
  return { context: evaluator.getContext(), result };
}

/**
 * Evaluate multiple expressions in sequence
 */
export function evaluateAll(
  expressions: string[],
  context: EvaluationContext
): { context: EvaluationContext; results: EvaluationResult[] } {
  const results: EvaluationResult[] = [];
  let currentContext = context;

  for (const expr of expressions) {
    const { context: newContext, result } = evaluateAndApply(
      expr,
      currentContext
    );
    currentContext = newContext;
    results.push(result);
  }

  return { context: currentContext, results };
}

/**
 * Check if an expression's condition is satisfied (without executing effects)
 */
export function checkCondition(
  expression: string,
  context: EvaluationContext
): boolean | "ai" {
  const ast = parse(expression);

  // If it's a conditional expression, evaluate just the condition
  if (ast.type === "conditional") {
    if (ast.condition.type === "ai_condition") {
      return "ai";
    }

    const evaluator = new Evaluator(context, expression);
    const conditionResult = evaluator.evaluate(ast.condition);
    return !!conditionResult.value;
  }

  // For non-conditional expressions, they're always "true"
  return true;
}
