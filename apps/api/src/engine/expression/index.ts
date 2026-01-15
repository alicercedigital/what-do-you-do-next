// Expression System - Public API
export { Lexer, tokenize } from "./lexer";
export { Parser, parse } from "./parser";
export {
  PathResolver,
  resolvePath,
  setPathValue,
} from "./resolver";
export {
  Evaluator,
  evaluate,
  evaluateAndApply,
  evaluateAll,
  checkCondition,
} from "./evaluator";

// Types
export type {
  Token,
  TokenType,
  ASTNode,
  LiteralNode,
  PathNode,
  UnaryNode,
  BinaryNode,
  AssignmentNode,
  ConditionalNode,
  FunctionCallNode,
  AiConditionNode,
  EvaluationContext,
  EvaluationResult,
  Mutation,
  AiConditionRequest,
  ResolvedPath,
} from "./types";
