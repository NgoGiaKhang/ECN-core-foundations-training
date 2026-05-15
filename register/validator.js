export class Validator {
  constructor(form, errorMessageSelector = ".error-message") {
    this.form = typeof form === "string" ? document.querySelector(form) : form;

    this.fields = {}; // { name: { el, rules } }
    this.errors = {}; // { name: message }
    this.errorMessageSelector = errorMessageSelector;
    this.onSubmit = null;
    this.bindFormSubmit();
  }

  register(name, element) {
    if (!element) throw Error(`Not found input with name '${name}'`);
    this.bindEvent(name, element);
    this.fields[name] = {
      element,
      rules: this.fields[name]?.rules || [],
      messageEl: element.parentElement.querySelector(this.errorMessageSelector),
    };
  }

  bindFormSubmit() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const isValid = this.validate();

      if (!isValid) return;

      const values = this.getValues();

      if (typeof this.onSubmit === "function") {
        await this.onSubmit(values);
      }
    });
  }

  getValues() {
    const values = {};

    Object.keys(this.fields).forEach((name) => {
      values[name] = this.fields[name]?.element?.value;
    });

    return values;
  }

  addRule(name, ...rules) {
    if (!this.fields[name]) {
      const el = this.form.querySelector(`[name='${name}']`);
      this.register(name, el);
    }

    this.fields[name].rules.push(...rules);
  }

  getValue = (name) => {
    return this.fields[name]?.element?.value;
  };

  setValue(name, value) {
    const field = this.fields[name];
    if (!field) return;

    field.element.value = value;
  }

  validateField(name) {
    const field = this.fields[name];
    if (!field) return true;

    const value = field.element.value;

    for (let rule of field.rules || []) {
      const error = rule(value, this.getValue);

      if (error) {
        this.errors[name] = error;
        return error;
      }
    }

    delete this.errors[name];
    return undefined;
  }

  validate() {
    let ok = true;

    for (let name in this.fields) {
      const error = this.validateField(name);
      if (error) {
        this.setError(name, error);
        ok = false;
      }
    }

    return ok;
  }

  bindEvent(name, el) {

    el.addEventListener("blur", () => {
      const error = this.validateField(name);
      if (error) {
        this.setError(name, error);
      }
    });

    el.addEventListener("focus", () => {
      this.clearError(name);
    });
  }

  clearError(name) {
    const field = this.fields[name];
    if (!field) return;
    delete this.errors[name];
    field.element.classList.remove("invalid");
    if (field.messageEl) {
      field.messageEl.textContent = "";
      field.messageEl.style.display = "none";
    }
  }

  setError(name, message) {
    const field = this.fields[name];
    if (!field) return;

    field.element.classList.add("invalid");

    if (field.messageEl) {
      field.messageEl.textContent = message;
      field.messageEl.style.display = "block";
    }
  }
}

export const required = (message = "Field is required") => {
  return (v) => (v ? undefined : message);
};

export const email = (message = "Invalid email") => {
  return (v) =>
    !v ? undefined : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : message;
};

export const phone = (message = "Invalid phone number") => {
  return (v) =>
    !v
      ? undefined
      : /^[0-9]{9,11}$/.test(v.replace(/\s/g, ""))
        ? undefined
        : message;
};

export const password = (
  message = "Password must be 8+ chars, 1 uppercase, 1 number, 1 special",
) => {
  return (v) => {
    if (!v) return undefined;

    const ok =
      v.length >= 8 &&
      /[A-Z]/.test(v) &&
      /[0-9]/.test(v) &&
      /[^A-Za-z0-9]/.test(v);

    return ok ? undefined : message;
  };
};
