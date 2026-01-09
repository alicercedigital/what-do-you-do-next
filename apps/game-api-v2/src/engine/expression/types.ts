// ============================================================================
// Expression AST Types
// ============================================================================

/**
 * Token types produced by the lexer
 */
export type TokenType =
  | "NUMBER"
  | "STRING"
  | "BOOLEAN"
  | "IDENTIFIER"
  | "OPERATOR"
  | "ASSIGN_OP"
  | "COMPARE_OP"
  | "LOGIC_OP"
  | "PAREN_OPEN"
  | "PAREN_CLOSE"
  | "DOT"
  | "COMMA"
  | "WILDCARD"
  | "KEYWORD"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/**
 * AST Node types
 */
export type ASTNode =
  | LiteralNode
  | PathNode
  | UnaryNode
  | BinaryNode
  | AssignmentNode
  | ConditionalNode
  | FunctionCallNode
  | AiConditionNode;

export interface LiteralNode {
  type: "literal";
  value: number | string | boolean;
}

export interface PathNode {
  type: "path";
  segments: string[];
  hasWildcard: boolean;
}

export interface UnaryNode {
  type: "unary";
  operator: string;
  operand: ASTNode;
}

export interface BinaryNode {
  type: "binary";
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface AssignmentNode {
  type: "assignment";
  target: PathNode;
  operator: string; // '=', '+=', '-=', '*=', '/='
  value: ASTNode;
}

export interface ConditionalNode {
  type: "conditional";
  expression: ASTNode;
  condition: ASTNode | AiConditionNode;
}

export interface FunctionCallNode {
  type: "function";
  name: string;
  args: ASTNode[];
}

export interface AiConditionNode {
  type: "ai_condition";
  hint: string;
}

/**
 * Evaluation context passed to the evaluator
 */
export interface EvaluationContext {
  // Game state
  characters: Array<{
    id: string;
    isPlayer?: boolean;
    stats: Record<string, number | boolean | string>;
    disposition: Record<string, number>;
    [key: string]: unknown;
  }>;
  moments: Array<{
    id: string;
    status?: string;
    [key: string]: unknown;
  }>;
  globalStats: Record<string, number | boolean | string>;

  // Special context variables
  self?: { id: string; [key: string]: unknown }; // Current moment for $self
  roll?: number; // Dice roll result for $roll
  round?: number; // Current challenge round for $round
  turn?: number; // Current game turn for $turn
  base?: number; // Base stat value for $base (in stat formulas)
}

/**
 * Result of evaluating an expression
 */
export interface EvaluationResult {
  value: unknown;
  mutations: Mutation[];
  aiConditions: AiConditionRequest[];
}

export interface Mutation {
  path: string[];
  value: unknown;
}

export interface AiConditionRequest {
  hint: string;
  expression: string;
}

/**
 * Resolved path with its value
 */
export interface ResolvedPath {
  path: string[];
  value: unknown;
  exists: boolean;
}
