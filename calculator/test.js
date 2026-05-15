import { Calculator, Operator } from "./Calculator.js";

const calculator = new Calculator();

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message}
Expected: ${expected}
Actual: ${actual}`
    );
  }

  console.log(`✓ ${message}`);
}

function assertThrows(callback, message) {
  try {
    callback();
    throw new Error("Expected error was not thrown");
  } catch {
    console.log(`✓ ${message}`);
  }
}

assertEqual(
  calculator.calculate(
    Operator.ADD,
    1,
    2
  ),
  3,
  "Add two numbers"
);

assertEqual(
  calculator.calculate(
    Operator.SUBTRACT,
    5,
    2
  ),
  3,
  "Subtract two numbers"
);

assertEqual(
  calculator.calculate(
    Operator.MULTIPLY,
    2,
    3
  ),
  6,
  "Multiply two numbers"
);

assertEqual(
  calculator.calculate(
    Operator.DIVIDE,
    10,
    2
  ),
  5,
  "Divide two numbers"
);

assertThrows(() => {
  calculator.calculate(
    Operator.DIVIDE,
    10,
    0
  );
}, "Divide by zero should throw");

assertThrows(() => {
  calculator.calculate(
    "%",
    1,
    2
  );
}, "Invalid operator should throw");

assertThrows(() => {
  calculator.calculate(
    Operator.ADD,
    "1",
    2
  );
}, "Invalid number should throw");

assertEqual(
  calculator.calculate(
    Operator.ADD,
    0.1,
    0.2
  ),
  0.3,
  "Fix floating point issue"
);

const histories =
  calculator.getHistories();

assertEqual(
  histories.length > 0,
  true,
  "History should be saved"
);

console.log("All tests passed");