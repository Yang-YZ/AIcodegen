from app.main import add, Calculator, calculate
import pytest

def test_add():
    assert add(1, 2) == 3

class TestCalculator:
    """Test suite for the Calculator class."""

    def setup_method(self):
        """Create a new Calculator instance for each test."""
        self.calc = Calculator()

    def test_add(self):
        """Test addition operation."""
        assert self.calc.add(2, 3) == 5
        assert self.calc.add(-1, 1) == 0
        assert self.calc.add(0, 0) == 0
        assert self.calc.add(10.5, 2.5) == 13.0

    def test_subtract(self):
        """Test subtraction operation."""
        assert self.calc.subtract(5, 3) == 2
        assert self.calc.subtract(0, 5) == -5
        assert self.calc.subtract(10, 10) == 0
        assert self.calc.subtract(3.5, 1.5) == 2.0

    def test_multiply(self):
        """Test multiplication operation."""
        assert self.calc.multiply(3, 4) == 12
        assert self.calc.multiply(0, 100) == 0
        assert self.calc.multiply(-2, 3) == -6
        assert self.calc.multiply(2.5, 4) == 10.0

    def test_divide(self):
        """Test division operation."""
        assert self.calc.divide(10, 2) == 5
        assert self.calc.divide(9, 3) == 3
        assert self.calc.divide(7, 2) == 3.5
        assert self.calc.divide(-10, 2) == -5

    def test_divide_by_zero(self):
        """Test that division by zero raises ZeroDivisionError."""
        with pytest.raises(ZeroDivisionError, match="division by zero"):
            self.calc.divide(10, 0)

class TestCalculate:
    """Test suite for the calculate function."""

    def test_simple_addition(self):
        """Test simple addition expressions."""
        assert calculate("2 + 3") == 5
        assert calculate("10 + 20") == 30

    def test_simple_subtraction(self):
        """Test simple subtraction expressions."""
        assert calculate("5 - 3") == 2
        assert calculate("10 - 15") == -5

    def test_simple_multiplication(self):
        """Test simple multiplication expressions."""
        assert calculate("3 * 4") == 12
        assert calculate("2 * 5") == 10

    def test_simple_division(self):
        """Test simple division expressions."""
        assert calculate("10 / 2") == 5
        assert calculate("9 / 3") == 3
        assert calculate("7 / 2") == 3.5

    def test_complex_expressions(self):
        """Test complex expressions with multiple operations."""
        assert calculate("2 + 3 * 4") == 14
        assert calculate("(2 + 3) * 4") == 20
        assert calculate("10 - 2 * 3") == 4
        assert calculate("(10 - 2) * 3") == 24

    def test_parentheses(self):
        """Test expressions with parentheses."""
        assert calculate("(5 + 3) * 2") == 16
        assert calculate("2 * (3 + 4)") == 14
        assert calculate("((2 + 3) * 4)") == 20

    def test_modulo(self):
        """Test modulo operation."""
        assert calculate("10 % 3") == 1
        assert calculate("20 % 4") == 0

    def test_floor_division(self):
        """Test floor division operation."""
        assert calculate("10 // 3") == 3
        assert calculate("20 // 4") == 5

    def test_exponentiation(self):
        """Test exponentiation operation."""
        assert calculate("2 ** 3") == 8
        assert calculate("3 ** 2") == 9
        assert calculate("10 ** 0") == 1

    def test_unary_operators(self):
        """Test unary plus and minus."""
        assert calculate("+5") == 5
        assert calculate("-5") == -5
        assert calculate("--5") == 5
        assert calculate("+-5") == -5

    def test_float_results(self):
        """Test expressions that result in floats."""
        assert calculate("7 / 2") == 3.5
        assert calculate("1 / 3") == pytest.approx(0.3333333333333333)

    def test_integer_normalization(self):
        """Test that integer-like floats are normalized to int."""
        assert calculate("10 / 2") == 5  # Should be int, not float
        assert isinstance(calculate("10 / 2"), int)
        assert isinstance(calculate("7 / 2"), float)

    def test_division_by_zero(self):
        """Test that division by zero raises ZeroDivisionError."""
        with pytest.raises(ZeroDivisionError, match="division by zero"):
            calculate("10 / 0")
        with pytest.raises(ZeroDivisionError, match="modulo by zero"):
            calculate("10 % 0")
        with pytest.raises(ZeroDivisionError, match="floor division by zero"):
            calculate("10 // 0")

    def test_empty_expression(self):
        """Test that empty expressions raise ValueError."""
        with pytest.raises(ValueError, match="empty expression"):
            calculate("")
        with pytest.raises(ValueError, match="empty expression"):
            calculate("   ")

    def test_invalid_expression(self):
        """Test that invalid expressions raise ValueError."""
        with pytest.raises(ValueError):
            calculate("2 +")
        with pytest.raises(ValueError):
            calculate("+")

    def test_unsupported_operations(self):
        """Test that unsupported operations raise ValueError."""
        with pytest.raises(ValueError):
            calculate("abs(-5)")  # Function calls not allowed
        with pytest.raises(ValueError):
            calculate("x + 5")  # Variables not allowed
        with pytest.raises(ValueError):
            calculate("[1, 2, 3]")  # Lists not allowed

    def test_type_error(self):
        """Test that non-string inputs raise TypeError."""
        with pytest.raises(TypeError, match="expression must be a string"):
            calculate(123)
        with pytest.raises(TypeError, match="expression must be a string"):
            calculate(None)
