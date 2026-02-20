def add(a, b):
    return a + b

# AI generated code
def multiply(a, b):
    """Return the product of a and b."""
    return a * b
# AI generated code
import ast
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
    if isinstance(node, ast.Num):  # pragma: no cover (compat)
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

if __name__ == "__main__":
    # Simple REPL for manual testing if run directly
    calc = Calculator()
    while True:
        try:
            s = input("calc> ").strip()
            if s in ("", "quit", "exit"):
                break
            print(calculate(s))
        except Exception as e:
            print("Error:", e)