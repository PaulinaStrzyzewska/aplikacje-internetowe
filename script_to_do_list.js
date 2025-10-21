class Todo {
  constructor() {
    // Tablica zadań (wczytana z localStorage lub pusta)
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // Elementy z HTML
    this.list = document.getElementById("task-list");
    this.inputText = document.getElementById("new-task");
    this.inputDate = document.getElementById("new-date");
    this.addBtn = document.getElementById("add-btn");
    this.search = document.getElementById("search");

    // Fraza wyszukiwania
    this.term = "";

    // Nasłuchiwanie zdarzeń
    this.addBtn.addEventListener("click", () => this.addTask());
    this.search.addEventListener("input", () => this.updateSearch());

    // Narysuj listę po załadowaniu
    this.draw();
  }

  // Zapisz do localStorage
  save() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  // Walidacja tekstu i daty
  validate(text, date) {
    if (text.length < 3 || text.length > 255) {
      alert("Zadanie musi mieć od 3 do 255 znaków!");
      return false;
    }
    if (date && new Date(date) < new Date()) {
      alert("Data musi być pusta albo w przyszłości!");
      return false;
    }
    return true;
  }

  // Dodaj nowe zadanie
  addTask() {
    const text = this.inputText.value.trim();
    const date = this.inputDate.value;

    if (!this.validate(text, date)) return;

    this.tasks.push({ text, date, done: false });
    this.save();
    this.inputText.value = "";
    this.inputDate.value = "";
    this.draw();
  }

  // Usuń zadanie
  deleteTask(index) {
    this.tasks.splice(index, 1);
    this.save();
    this.draw();
  }

  // Edytuj zadanie po kliknięciu
//   editTask(index, span, small) {
//     const textInput = document.createElement("input");
//     textInput.type = "text";
//     textInput.value = this.tasks[index].text;
//     textInput.className = "edit-input";

//     const dateInput = document.createElement("input");
//     dateInput.type = "date";
//     dateInput.value = this.tasks[index].date;
//     dateInput.className = "edit-input";

//     const save = () => {
//         const newText = textInput.value.trim();
//         const newDate = dateInput.value;

//         if (newText.length >= 3 && newText.length <= 255) {
//             this.tasks[index].text = newText;
//             this.tasks[index].date = newDate;
//             this.save();
//             this.draw();
//         } else {
//             alert("Zadanie musi mieć od 3 do 255 znaków!");
//             textInput.focus();
//         }
//     };

//     textInput.addEventListener("blur", save);
//     dateInput.addEventListener("blur", save);

//     textInput.addEventListener("keydown", (e) => {
//         if (e.key === "Enter") save();
//         if (e.key === "Escape") this.draw();
//     });
//     dateInput.addEventListener("keydown", (e) => {
//         if (e.key === "Enter") save();
//         if (e.key === "Escape") this.draw();
//     });

//     span.replaceWith(textInput);
//     if (small) small.replaceWith(dateInput);

//     textInput.focus();
//   }
editTask(index, target) {
    let input;

    if (target.tagName === "SPAN") {
        input = document.createElement("input");
        input.type = "text";
        input.value = this.tasks[index].text;
    } else if (target.tagName === "SMALL") {
        input = document.createElement("input");
        input.type = "date";
        input.value = this.tasks[index].date || "";
    } else {
        return; // nic nie rób jeśli to coś innego
    }

    input.className = "edit-input";

    const save = () => {
        if (target.tagName === "SPAN") {
            const val = input.value.trim();
            if (val.length < 3 || val.length > 255) {
                alert("Zadanie musi mieć od 3 do 255 znaków!");
                input.focus();
                return;
            }
            this.tasks[index].text = val;
        } else if (target.tagName === "SMALL") {
            this.tasks[index].date = input.value;
        }

        this.save();
        this.draw();
    };

    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") this.draw();
    });

    target.replaceWith(input);
    input.focus();
}


  // Zmień status ukończenia
  toggleDone(index) {
    this.tasks[index].done = !this.tasks[index].done;
    this.save();
    this.draw();
  }

  // Aktualizuj frazę wyszukiwania
  updateSearch() {
    this.term = this.search.value.trim().toLowerCase();
    this.draw();
  }

  // Narysuj listę zadań
  draw() {
    this.list.innerHTML = "";

    const filteredTasks = this.tasks.filter(task =>
      task.text.toLowerCase().includes(this.term)
    );

    filteredTasks.forEach((task, index) => {
      const li = document.createElement("li");

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.addEventListener("change", () => this.toggleDone(index));
      li.appendChild(checkbox);

      // Tekst zadania
      const span = document.createElement("span");
      span.className = "task-text";
      span.innerHTML = this.highlightTerm(task.text);
      if (task.done) span.style.textDecoration = "line-through";
      //span.addEventListener("click", () => this.editTask(index, span, small));
      li.appendChild(span);

      // Data (jeśli jest)
      let small = null;
      if (task.date) {
        small = document.createElement("small");
        small.className = "task-date";
        small.textContent = task.date;
        li.appendChild(small);
      }

      span.addEventListener("click", (e) => this.editTask(index, e.target));
     
      if (small) {
        small.addEventListener("click", (e) => this.editTask(index, e.target));
      }
 
      // Przycisk usuń
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.addEventListener("click", () => this.deleteTask(index));
      li.appendChild(delBtn);

      this.list.appendChild(li);
    });
  }

  // Wyróżnienie wyszukiwanego tekstu
  highlightTerm(text) {
    if (this.term.length < 2) return text;
    const re = new RegExp(`(${this.term})`, "gi");
    return text.replace(re, `<mark>$1</mark>`);
  }
}

// Uruchom po załadowaniu strony
document.addEventListener("DOMContentLoaded", () => new Todo());
