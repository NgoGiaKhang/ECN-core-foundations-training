import { Calculator, DECIMAL_SEPARATOR, Operator } from "./calculator.js";

const operatorKeyMapping = {
  "+": Operator.ADD,
  "-": Operator.SUBTRACT,
  "*": Operator.MULTIPLY,
  "/": Operator.DIVIDE,
};

export class App {
  constructor() {
    this.operator = new Property(null);
    this.number1 = new Property("");
    this.number2 = new Property("");
    this.result = new Property(null);
    this.error = new Property("");
    this.history = [];
    this.calculator = new Calculator();
    this.init();
  }

  init() {
    this.initNumberButtons();
    this.initOperatorButtons();
    this.initEqualButton();
    this.initClearButton();
    this.initDisplay();
    this.initExpression();
    this.initHistory();
    this.initBackButton();
    this.initKeyboard(1);
  }

  initKeyboard() {
    window.addEventListener("keydown", (e) => {
      const key = e.key;

      // number 0-9
      if (!isNaN(key)) {
        this.handleNumberClick(key);
        return;
      }

      // dot
      if (key === ".") {
        this.handleNumberClick(DECIMAL_SEPARATOR);
        return;
      }

      // operator
      if (["+", "-", "*", "/"].includes(key)) {
        this.handleOperatorClick(operatorKeyMapping[key]);
        return;
      }

      // enter = calc
      if (key === "Enter") {
        this.handleEqualClick();
        return;
      }

      // backspace
      if (key === "Backspace") {
        this.handleBack();
        return;
      }

      // escape = clear
      if (key === "Escape") {
        this.clear();
        return;
      }
    });
  }

  initBackButton() {
    const back = document.querySelector(".calculator__button--back");

    back.addEventListener("click", () => this.handleBack());
  }

  initNumberButtons() {
    const numberButtons = document.querySelectorAll(
      ".calculator__button--number",
    );

    numberButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.handleNumberClick(button.textContent.trim());
      });
    });
  }

  initOperatorButtons() {
    const operatorButtons = document.querySelectorAll(
      ".calculator__button--operator",
    );

    const operators = Object.values(Operator);

    operatorButtons.forEach((button, i) => {
      button.textContent = operators[i];

      button.addEventListener("click", () => {
        this.handleOperatorClick(operators[i]);
      });
    });
  }

  initEqualButton() {
    const equalButton = document.querySelector(".calculator__button--equal");

    equalButton.addEventListener("click", () => {
      this.handleEqualClick();
    });
  }

  initClearButton() {
    const clearButton = document.querySelector(".calculator__button--clear");

    clearButton.addEventListener("click", () => this.clear());
  }

  initDisplay() {
    const display = document.querySelector(".calculator__display");

    const updateDisplay = () => {
      display.value = this.displayString();
    };

    this.result.subscribe(updateDisplay);
    this.number1.subscribe(updateDisplay);
    this.number2.subscribe(updateDisplay);
    this.operator.subscribe(updateDisplay);
    this.error.subscribe(updateDisplay)
  }

  initExpression() {
    const expression = document.querySelector(".calculator__expression");

    this.result.subscribe(() => {
      expression.value =
        this.result.value != null
          ? `${this.number1.value} ${this.operator.value} ${this.number2.value}`
          : "";
    });
  }

  initHistory() {
    const history = document.querySelector(".calculator__histories");
    this.result.subscribe(() => {
      this.renderHistory(history);
    });
  }

  handleNumberClick(number) {
    if (this.result.value != null) {
      this.clear();
    }

    const target = this.operator.value ? this.number2 : this.number1;

    if (number === DECIMAL_SEPARATOR) {
      if (target.value === "") {
        target.value = "0.";
        return;
      }

      if (target.value.includes(DECIMAL_SEPARATOR)) {
        return;
      }
    }

    target.value += number;
  }

  handleBack() {
    if (this.result.value != null) {
      this.clear();
      return;
    }

    if (this.number2.value) {
      this.number2.value = this.number2.value.slice(0, -1);
      return;
    }

    if (this.operator.value) {
      this.operator.value = null;
      return;
    }

    if (this.number1.value) {
      this.number1.value = this.number1.value.slice(0, -1);
    }
  }

  handleOperatorClick(operator) {
    
    if (this.number2) {
      this.handleEqualClick();
    }

    if (this.result.value) {
      const temp = this.result.value;
      this.clear();
      this.number1.value = temp;
    }
    if (this.number1.value) {
      this.operator.value = operator;
    }
  }

  handleEqualClick() {
    if (!this.number1.value || !this.number2.value) {
      return;
    }

    try {
      this.result.value = this.calculator.calculate(
        this.operator.value,
        Number(this.number1.value),
        Number(this.number2.value),
      );

      this.addHistory();
    } catch (e) {
      this.error.value = e.message
    }
  }

  addHistory() {
    this.history.unshift({
      number1: this.number1.value,
      operator: this.operator.value,
      number2: this.number2.value,
      result: this.result.value,
    });
  }

  renderHistory(element) {
    element.innerHTML = this.calculator
      .getHistories()
      .map(
        (item) =>
          `
          <li class="calculator__history-item">
            ${item.num1}
            ${item.operator}
            ${item.num2}
            =
            ${item.result}
          </li>
        `,
      )
      .join("");
  }

  displayString() {
    if (this.error.value) {
      return this.error.value;
    }

    if (this.result.value != null) {
      return this.result.value;
    }

    return (
      this.number1.value +
      " " +
      (this.operator.value ?? "") +
      " " +
      this.number2.value
    );
  }

  clear() {
    this.number1.value = "";
    this.number2.value = "";
    this.operator.value = null;
    this.result.value = null;
    this.error.value = null
  }
}

export class Property {
  constructor(initValue) {
    this._value = initValue;
    this._subscribers = [];
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (this._value === newValue) {
      return;
    }

    this._value = newValue;

    this.notify();
  }

  subscribe(listener) {
    this._subscribers.push(listener);
  }

  notify() {
    for (const listener of this._subscribers) {
      listener(this._value);
    }
  }
}
