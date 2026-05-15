import { TodoManager } from "./todo.js";


export class TodoApp {
  constructor() {
    this.manager = new TodoManager();

    this.state = {
      filter: "",
    };

    this.elements = {};

    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  cacheDOM() {
    this.elements = {
      input: document.querySelector(".todo__input"),
      list: document.querySelector(".todo__list"),
      addBtn: document.querySelector(".todo__button--add"),
      filters: document.querySelectorAll(".todo__filter"),
      countAll: document.querySelector("[data-count='all']"),
      countActive: document.querySelector("[data-count='active']"),
      countCompleted: document.querySelector("[data-count='completed']"),
    };
  }

  bindEvents() {
    // ADD
    this.elements.addBtn.addEventListener("click", () => this.handleAdd());

    this.elements.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.handleAdd();
    });

    // EVENT DELEGATION (toggle + delete)
    this.elements.list.addEventListener("click", (e) => {
      const item = e.target.closest(".todo__item");
      if (!item) return;

      const id = item.dataset.id;

      if (e.target.classList.contains("todo__button--toggle")) {
        this.manager.toggle(id);
        this.render();
      }

      if (e.target.classList.contains("todo__button--delete")) {
        this.manager.remove(id);
        this.render();
      }
    });

    // FILTER
    this.elements.filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.filter = btn.dataset.status;
        
        this.elements.filters.forEach((b) =>
          b.classList.remove("todo__filter--active"),
        );

        btn.classList.add("todo__filter--active");

        this.render();
      });
    });
  }

  handleAdd() {
    const text = this.elements.input.value.trim();
    if (!text) return;

    this.manager.add(text);

    this.elements.input.value = "";

    this.render();
  }

  render() {
    const todos = this.manager.getByFilter(this.state.filter);
    const count = this.manager.count();

    // CLEAR (NO innerHTML)
    while (this.elements.list.firstChild) {
      this.elements.list.removeChild(this.elements.list.firstChild);
    }

    // RENDER LIST
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = `todo__item ${todo.isCompleted ? "todo__item--completed" : ""}`;
      li.dataset.id = todo.id;

      const text = document.createElement("span");
      text.className = "todo__text";
      text.textContent = todo.text;

      const actions = document.createElement("div");
      actions.className = "todo__actions";

      const toggle = document.createElement("button");
      toggle.className = "todo__button todo__button--toggle";
      toggle.textContent = "✓";

      const del = document.createElement("button");
      del.className = "todo__button todo__button--delete";
      del.textContent = "✕";

      actions.appendChild(toggle);
      actions.appendChild(del);

      li.appendChild(text);
      li.appendChild(actions);

      this.elements.list.appendChild(li);
    });

    // UPDATE COUNTS (if exist in HTML)
    if (this.elements.countAll) {
      this.elements.countAll.textContent = count.all;
      this.elements.countActive.textContent = count.active;
      this.elements.countCompleted.textContent = count.completed;
    }
  }
}
