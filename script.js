const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const category = document.getElementById("category");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeBtn = document.getElementById("themeBtn");
const sortTasks = document.getElementById("sortTasks");
const exportPDF = document.getElementById("exportPDF");
const exportExcel = document.getElementById("exportExcel");
let taskChart;      
let categoryChart;
let currentFilter = "all";
let dragStartIndex;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save Tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display Tasks
function displayTasks(filter = "") {

    taskList.innerHTML = "";

    let completed = 0;
    let pending = 0;
    let overdue = 0;

   // Sort Tasks
let sortedTasks = [...tasks];

if (sortTasks.value === "priority") {

    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    };

    sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

}
else if (sortTasks.value === "date") {

    sortedTasks.sort((a, b) => {

        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return new Date(a.dueDate) - new Date(b.dueDate);

    });

}
else if (sortTasks.value === "az") {

    sortedTasks.sort((a, b) => a.text.localeCompare(b.text));

}

sortedTasks.forEach((task) => {

    const index = tasks.indexOf(task);

        // Search Filter
        if (!task.text.toLowerCase().includes(filter.toLowerCase())) {
            return;
        }

        // Status Filter
        if (currentFilter === "active" && task.completed) {
            return;
        }

        if (currentFilter === "completed" && !task.completed) {
            return;
        }

        const li = document.createElement("li");
li.setAttribute("draggable", true);
li.addEventListener("dragstart", () => {

    dragStartIndex = index;

    li.classList.add("dragging");

});

li.addEventListener("dragend", () => {

    li.classList.remove("dragging");

});

li.addEventListener("dragover", (e) => {

    e.preventDefault();

});

li.addEventListener("drop", () => {

    const draggedTask = tasks[dragStartIndex];

    tasks.splice(dragStartIndex, 1);

    tasks.splice(index, 0, draggedTask);

    saveTasks();

    displayTasks(searchInput.value);

});
        const span = document.createElement("span");

        let status = "";

if (task.dueDate) {

    const today = new Date();
    today.setHours(0,0,0,0);

    const due = new Date(task.dueDate);
    due.setHours(0,0,0,0);

    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (!task.completed) {

        if (diff < 0) {

            status = "🔴 Overdue";

        }
        else if (diff === 0) {

            status = "🟡 Due Today";

        }
        else {

            status = `🟢 ${diff} Day${diff > 1 ? "s" : ""} Left`;

        }

    }

}





span.innerHTML = `
<strong>${task.completed ? "✅ " : ""}${task.text}</strong><br>
<small>${task.priority}</small><br>
<small>📂 ${task.category}</small><br>
<small>📅 ${task.dueDate || "No Date"}</small><br>
<small class="status">${status}</small>
`;

        span.classList.add("task");

        if (task.completed) {
            span.classList.add("completed");
            completed++;
        } else {
            pending++;
        }

        // Overdue Count
        if(task.dueDate && !task.completed){

    const today = new Date();
    today.setHours(0,0,0,0);

    const due = new Date(task.dueDate);
    due.setHours(0,0,0,0);

    if(due < today){

        overdue++;

    }

}

        // Complete Task
        span.addEventListener("click", () => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            displayTasks(searchInput.value);
        });

        // Edit Button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit");

        editBtn.addEventListener("click", () => {

            const newTask = prompt("Edit Task", task.text);

            if (newTask !== null && newTask.trim() !== "") {

                tasks[index].text = newTask.trim();

                saveTasks();

                displayTasks(searchInput.value);

            }

        });

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete");

        deleteBtn.addEventListener("click", () => {

            tasks.splice(index, 1);

            saveTasks();

            displayTasks(searchInput.value);

        });

        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);

    });

    // Dashboard
    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("overdueTasks").textContent = overdue;

    // Progress Bar
    const percent =
        tasks.length === 0
            ? 0
            : Math.round((completed / tasks.length) * 100);

    document.getElementById("progressText").textContent = percent + "%";
    document.getElementById("progressFill").style.width = percent + "%";
    updateCharts(completed, pending);
    updateAI(completed, pending, overdue);
    
}
function updateCharts(completed, pending) {

    const study = tasks.filter(task => task.category === "Study").length;
    const work = tasks.filter(task => task.category === "Work").length;
    const personal = tasks.filter(task => task.category === "Personal").length;
    const shopping = tasks.filter(task => task.category === "Shopping").length;

    // Destroy old charts
    if(taskChart){
        taskChart.destroy();
    }

    if(categoryChart){
        categoryChart.destroy();
    }

    // Pie Chart
    taskChart = new Chart(document.getElementById("taskChart"),{
        type:"pie",
        data:{
            labels:["Completed","Pending"],
            datasets:[{
                data:[completed,pending],
                backgroundColor:["#22c55e","#ef4444"]
            }]
        }
    });

    // Bar Chart
    categoryChart = new Chart(document.getElementById("categoryChart"),{
        type:"bar",
        data:{
            labels:["Study","Work","Personal","Shopping"],
            datasets:[{
                label:"Tasks",
                data:[study,work,personal,shopping],
                backgroundColor:[
                    "#3b82f6",
                    "#f59e0b",
                    "#10b981",
                    "#8b5cf6"
                ]
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    display:false
                }
            }
        }
    });

}
function updateAI(completed, pending, overdue){

    const total = completed + pending;

    const score = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("productivityScore").textContent = score + "%";

    // Badge
    let badge = "🥉 Beginner";

    if(score >= 25) badge = "🥈 Consistent";
    if(score >= 60) badge = "🥇 Productive";
    if(score >= 90) badge = "🏆 Master";

    document.getElementById("badge").textContent = badge;

    // AI Suggestion
    let suggestion = "";

    if(total === 0){

        suggestion = "Start adding tasks 🚀";

    }
    else if(overdue > 0){

        suggestion = `⚠️ You have ${overdue} overdue task(s).`;

    }
    else if(pending > completed){

        suggestion = "📌 Complete a few pending tasks today.";

    }
    else{

        suggestion = "🎉 Excellent work! Keep it up.";

    }

    document.getElementById("aiSuggestion").textContent = suggestion;

    // Quotes
    const quotes = [

        "Small progress is still progress.",
        "Done is better than perfect.",
        "Discipline beats motivation.",
        "Stay focused and never quit.",
        "Consistency creates success."

    ];

    document.getElementById("quote").textContent =
        quotes[Math.floor(Math.random()*quotes.length)];

}

   

// Add Button
addBtn.addEventListener("click", addTask);

// Enter Key
taskInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        addTask();
    }

});

// Search
searchInput.addEventListener("input", () => {

    displayTasks(searchInput.value);

});

// Clear All
clearBtn.addEventListener("click", () => {

    if (confirm("Delete all tasks?")) {

        tasks = [];

        saveTasks();

        displayTasks(searchInput.value);

    }

});

// Filter Buttons
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        displayTasks(searchInput.value);

    });

});

// Load Theme
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

}

// Theme Toggle
themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeBtn.textContent = "☀️";

        localStorage.setItem("theme", "dark");

    } else {

        themeBtn.textContent = "🌙";

        localStorage.setItem("theme", "light");

    }

});

// Initial Load
displayTasks();
sortTasks.addEventListener("change",()=>{

    displayTasks(searchInput.value);

});
document.addEventListener("DOMContentLoaded", function () {

    const calendarEl = document.getElementById("calendar");

    const calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: "dayGridMonth",

        height: 500,

        events: tasks
            .filter(task => task.dueDate)
            .map(task => ({
                title: task.text,
                start: task.dueDate
            }))

    });

    calendar.render();

});


// Add Task
function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Enter a task!");
        return;
    }

    tasks.push({
        text: text,
        completed: false,
        priority: priority.value,
        category: category.value,
        dueDate: dueDate.value,
        createdAt: Date.now()
    });

    saveTasks();
    displayTasks(searchInput.value);

taskInput.value = "";
dueDate.value = "";
priority.value = "Medium";
category.value = "Study";
}
exportPDF.addEventListener("click", () => {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Smart To-Do Report", 20, 20);

    let y = 35;

    tasks.forEach((task, index) => {

        doc.setFontSize(12);

        doc.text(
            `${index + 1}. ${task.text}
Priority : ${task.priority}
Category : ${task.category}
Due Date : ${task.dueDate || "No Date"}
Status : ${task.completed ? "Completed" : "Pending"}`,
            20,
            y
        );

        y += 28;

        if (y > 260) {
            doc.addPage();
            y = 20;
        }

    });

    doc.save("SmartTodo.pdf");

});
exportPDF.addEventListener("click", () => {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Smart To-Do Report", 20, 20);

    let y = 35;

    tasks.forEach((task, index) => {

        doc.setFontSize(12);

        doc.text(
            `${index + 1}. ${task.text}
Priority : ${task.priority}
Category : ${task.category}
Due Date : ${task.dueDate || "No Date"}
Status : ${task.completed ? "Completed" : "Pending"}`,
            20,
            y
        );

        y += 28;

        if (y > 260) {
            doc.addPage();
            y = 20;
        }

    });

    doc.save("SmartTodo.pdf");

});
