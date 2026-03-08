def add(a, b):
    return a + b

# AI generated code
def multiply(a, b):
    """Return the product of a and b."""
    return a * b
# AI generated code
import ast

# Compatibility alias for older Python versions that used ast.Num
try:
    AST_NUM = ast.Num  # type: ignore[attr-defined]
except AttributeError:  # Python 3.12+ where ast.Num is removed
    AST_NUM = ()

import operator

class Calculator:
    """Simple arithmetic calculator with basic operations."""
    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b

    def divide(self, a, b):
        if b == 0:
            raise ZeroDivisionError("division by zero")
        return a / b

def _eval_ast(node):
    """Recursively evaluate a restricted AST for arithmetic expressions."""
    if isinstance(node, ast.Expression):
        return _eval_ast(node.body)

    # Constants (Python 3.8+: ast.Constant, older: ast.Num)
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant: {node.value}")
    if isinstance(node, AST_NUM):  # pragma: no cover (compat)
        return node.n

    # Unary operations: +, -
    if isinstance(node, ast.UnaryOp):
        operand = _eval_ast(node.operand)
        if isinstance(node.op, ast.UAdd):
            return +operand
        if isinstance(node.op, ast.USub):
            return -operand
        raise ValueError(f"Unsupported unary operator: {node.op}")

    # Binary operations: +, -, *, /, %, //, **
    if isinstance(node, ast.BinOp):
        left = _eval_ast(node.left)
        right = _eval_ast(node.right)

        if isinstance(node.op, ast.Add):
            return left + right
        if isinstance(node.op, ast.Sub):
            return left - right
        if isinstance(node.op, ast.Mult):
            return left * right
        if isinstance(node.op, ast.Div):
            if right == 0:
                raise ZeroDivisionError("division by zero")
            return left / right
        if isinstance(node.op, ast.Mod):
            if right == 0:
                raise ZeroDivisionError("modulo by zero")
            return left % right
        if isinstance(node.op, ast.FloorDiv):
            if right == 0:
                raise ZeroDivisionError("floor division by zero")
            return left // right
        if isinstance(node.op, ast.Pow):
            return left ** right

        raise ValueError(f"Unsupported binary operator: {node.op}")

    # Parentheses are represented by nested nodes; nothing extra to handle.

    raise ValueError(f"Unsupported expression: {ast.dump(node)}")

def calculate(expr):
    """
    Safely calculate the value of a simple arithmetic expression given as a string.
    Supports integer and float literals, parentheses, unary +/-, and operators:
    +, -, *, /, %, //, **
    Returns an int when the result is an exact integer, otherwise a float.
    Raises ValueError for invalid expressions and ZeroDivisionError for division by zero.
    """
    if not isinstance(expr, str):
        raise TypeError("expression must be a string")

    expr = expr.strip()
    if expr == "":
        raise ValueError("empty expression")

    try:
        parsed = ast.parse(expr, mode='eval')
    except SyntaxError as e:
        raise ValueError(f"invalid expression: {e}")

    # Walk AST to ensure no names, attributes, calls, etc. Only allow permitted nodes.
    for node in ast.walk(parsed):
        if isinstance(node, (ast.Call, ast.Name, ast.Attribute, ast.Subscript, ast.List, ast.Dict, ast.Set, ast.Lambda, ast.IfExp, ast.Compare, ast.BoolOp)):
            raise ValueError(f"unsupported expression element: {type(node).__name__}")

    result = _eval_ast(parsed)

    # Normalize integer-like floats to int
    if isinstance(result, float) and result.is_integer():
        return int(result)
    return result

# For convenience, provide an alias
evaluate = calculate

# AI generated code
import random
from typing import Callable, Dict, Optional

def guessing_game(secret: Optional[int] = None,
                  max_attempts: int = 10,
                  input_fn: Callable[[str], str] = input,
                  print_fn: Callable[..., None] = print) -> Dict[str, object]:
    """
    Play a number guessing game.

    Parameters:
    - secret: if provided, the number to guess; otherwise a random int 1..100 is chosen.
    - max_attempts: maximum number of valid guess attempts allowed.
    - input_fn: function used to read user input (default: built-in input).
    - print_fn: function used to output messages (default: built-in print).

    Returns a dict with:
    - 'success': bool whether the player guessed correctly.
    - 'attempts': number of valid attempts used.
    - 'secret': the secret number.
    """
    if secret is None:
        secret = random.randint(1, 100)

    attempts = 0

    while attempts < max_attempts:
        try:
            prompt = f"Enter your guess (1-100) [{attempts+1}/{max_attempts}]: "
            raw = input_fn(prompt)
        except (EOFError, KeyboardInterrupt):
            print_fn("")  # keep behavior tidy if interrupted
            break

        if raw is None:
            # Treat None like interruption
            break

        raw = raw.strip()
        if not raw:
            print_fn("Invalid input. Please enter an integer.")
            continue

        try:
            guess = int(raw)
        except ValueError:
            print_fn("Invalid input. Please enter an integer.")
            continue

        attempts += 1

        if guess < secret:
            print_fn("Too low.")
        elif guess > secret:
            print_fn("Too high.")
        else:
            print_fn(f"Correct! You got it in {attempts} {'try' if attempts == 1 else 'tries'}.")
            return {"success": True, "attempts": attempts, "secret": secret}

    print_fn(f"Game over. The number was {secret}.")
    return {"success": False, "attempts": attempts, "secret": secret}


def main():
    """
    Run an interactive guessing game using standard input/output.
    """
    guessing_game()  # use defaults that rely on built-in input/print


if __name__ == "__main__":
    main()