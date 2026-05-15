export class TodoManager {
  constructor() {
    this.todos = [];
  }

  add(text) {
    const todo = new Todo(text);
    this.todos.push(todo);
    return todo;
  }

  remove(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
  }

  toggle(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) todo.toggle();
  }

  getByFilter(filter) {
    if (filter) {
      return this.todos.filter((t) => t.status == filter);
    }

    return this.todos;
  }

  count() {
    return {
      total: this.todos.length,
      active: this.todos.filter((t) => t == TodoStatus.ACTIVE).length,
      completed: this.todos.filter((t) => t.isCompleted).length,
    };
  }
}

export const TodoStatus = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
});

export class Todo {
  constructor(text) {
    this.id = crypto.randomUUID();
    this.text = text;
    this.status = TodoStatus.ACTIVE;
  }

  get isCompleted() {
    return this.status === TodoStatus.COMPLETED;
  }

  toggle(){
    this.status = this.status === TodoStatus.COMPLETED ? TodoStatus.ACTIVE : TodoStatus.COMPLETED
  }
}
