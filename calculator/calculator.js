export const Operator = {
  ADD: "+",
  SUBTRACT: "-",
  MULTIPLY: "×",
  DIVIDE: "÷",
};

export const DECIMAL_SEPARATOR = ".";
export class Calculator {
  constructor() {
    this.histories = [];
  }

  calculate(operator, number1, number2) {
    switch (operator) {
      case Operator.ADD:
        return this.add(number1, number2);
      case Operator.SUBTRACT:
        return this.subtract(number1, number2);
      case Operator.MULTIPLY:
        return this.multiply(number1, number2);
      case Operator.DIVIDE:
        return this.divide(number1, number2);
      default:
        throw new Error("Invalid operator");
    }
  }

  add(number1, number2) {
    this.assertNumber(number1);
    this.assertNumber(number2);
    const result = this.round(number1 + number2);
    this.saveHistory(Operator.ADD, number1, number2, result);
    return result;
  }

  subtract(number1, number2) {
    this.assertNumber(number1);
    this.assertNumber(number2);
    const result = this.round(number1 - number2);
    this.saveHistory(Operator.SUBTRACT, number1, number2, result);
    return result;
  }

  multiply(number1, number2) {
    this.assertNumber(number1);
    this.assertNumber(number2);
    const result = this.round(number1 * number2);
    this.saveHistory(Operator.MULTIPLY, number1, number2, result);
    return result;
  }

  divide(number1, number2) {
    this.assertNumber(number1);
    this.assertNumber(number2);

    if (number2 === 0) {
      throw new Error("Cannot divide by zero");
    }

    const result = this.round(number1 / number2);

    this.saveHistory(Operator.DIVIDE, number1, number2, result);

    return result;
  }

  round(number, precision = 10) {
    return Number(number.toFixed(precision));
  }

  saveHistory(operator, num1, num2, result) {
    const history = new History(operator, num1, num2, result);
    this.histories.push(history);
  }

  getHistories() {
    return this.histories;
  }

  assertNumber(number) {
    if (typeof number !== "number" || Number.isNaN(number)) {
      throw new Error("Value must be a valid number");
    }
  }
}
export class History {
  constructor(operator, num1, num2, result) {
    this.operator = operator;
    this.num1 = num1;
    this.num2 = num2;
    this.result = result;
    this.createdAt = new Date();
  }
}
