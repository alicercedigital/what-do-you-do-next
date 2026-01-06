/**
 * Shared validation and utility functions for formula parsers
 */

export interface FormulaToken {
  type: string;
  value: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const VALID_FUNCTIONS = ["min", "max", "floor", "ceil"];

/**
 * Validates that parentheses are balanced in a token array
 */
export function validateParentheses(tokens: FormulaToken[]): ValidationResult {
  let count = 0;
  for (const t of tokens) {
    if (t.type === "parenthesis") {
      if (t.value === "(") count++;
      else count--;
      if (count < 0) {
        return { valid: false, error: "Unexpected closing parenthesis" };
      }
    }
  }
  return count === 0
    ? { valid: true }
    : { valid: false, error: "Missing closing parenthesis" };
}

/**
 * Validates that function calls use valid function names
 */
export function validateFunctions(tokens: FormulaToken[]): ValidationResult {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === "function") {
      if (!VALID_FUNCTIONS.includes(token.value.toLowerCase())) {
        return {
          valid: false,
          error: `Invalid function: ${
            token.value
          }. Valid functions are: ${VALID_FUNCTIONS.join(", ")}`,
        };
      }
    }
  }
  return { valid: true };
}

/**
 * Validates that operators are properly placed
 */
export function validateOperators(tokens: FormulaToken[]): ValidationResult {
  const operators = ["+", "-", "*", "/", "^"];
  const lastToken = tokens[tokens.length - 1];

  // Formula cannot end with an operator
  if (lastToken && operators.includes(lastToken.value)) {
    return { valid: false, error: "Formula cannot end with an operator" };
  }

  // Check for consecutive operators
  for (let i = 0; i < tokens.length - 1; i++) {
    if (
      operators.includes(tokens[i].value) &&
      operators.includes(tokens[i + 1].value)
    ) {
      return { valid: false, error: "Consecutive operators are not allowed" };
    }
  }

  return { valid: true };
}

/**
 * Validates that the formula has balanced structure
 */
export function validateFormulaStructure(
  tokens: FormulaToken[]
): ValidationResult {
  const validations = [
    validateParentheses,
    validateFunctions,
    validateOperators,
  ];

  for (const validation of validations) {
    const result = validation(tokens);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * Extracts attribute IDs from formula tokens
 */
export function extractAttributeIds(tokens: FormulaToken[]): string[] {
  const ids = new Set<string>();

  for (const token of tokens) {
    if (token.type === "attribute") {
      ids.add(token.value);
    }
  }

  return Array.from(ids);
}

/**
 * Validates that all referenced attributes exist in the provided set
 */
export function validateAttributesExist(
  tokens: FormulaToken[],
  validAttributes: Set<string>
): ValidationResult {
  const attributeIds = extractAttributeIds(tokens);

  for (const id of attributeIds) {
    if (!validAttributes.has(id)) {
      return {
        valid: false,
        error: `Unknown attribute: ${id}`,
      };
    }
  }

  return { valid: true };
}
