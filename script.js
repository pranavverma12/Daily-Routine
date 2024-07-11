// script.js
const tasks = [
    {
        startTime: "00:00",
        endTime: "08:30",
        icon: "fas fa-moon",
        title: "Sleep",
        description: "Getting a good night's sleep.",
        checked: false,
        repeat: false,
        repeatDays: [],
        taskColor: "rgba(0, 0, 255, 0.1)",
        createdDay: "Monday"
    },
    {
        startTime: "09:00",
        endTime: "10:00",
        icon: "fas fa-utensils",
        title: "Breakfast",
        description: "Having a healthy breakfast.",
        checked: true,
        repeat: true,
        repeatDays: ["Monday", "Wednesday", "Friday"],
        taskColor: "rgba(255, 0, 0, 0.1)",
        createdDay: "Monday"
    },
    {
        startTime: "10:30",
        endTime: "11:30",
        icon: "fas fa-laptop",
        title: "Work",
        description: "Focus on work tasks.",
        checked: false,
        repeat: true,
        repeatDays: ["Monday", "Wednesday", "Friday"],
        taskColor: "rgba(0, 255, 0, 0.1)",
        createdDay: "Wednesday"
    },
    {
        startTime: "08:00", // HH:MM format
        endTime: "09:00", // HH:MM format
        icon: "📝", // Unicode emoji or URL to an image
        title: "Morning Exercise",
        description: "30 minutes of jogging followed by stretching exercises.",
        checked: false, // Boolean to indicate if the task is completed
        repeat: true, // Boolean to indicate if the task repeats
        repeatDays: ["Friday", "Thurday"], // Array of days for repetition
        taskColor: "rgb(236 56 38 / 20%)", // Hex color code
        createdDay: "Tuesday" // YYYY-MM-DD format
    }
];

let db = null; // Declare db variable globally

document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const calendarDaysContainer = document.querySelector('.days');
    const monthYearDisplay = document.querySelector('.month-year');
    const modal = document.getElementById('routine-modal');
    const closeButton = document.querySelector('.close-button');
    const routineForm = document.getElementById('routine-form');
    const repeatCheckbox = document.getElementById('repeat');
    const repeatDaysContainer = document.getElementById('repeat-days-container');

    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const load_emoji = () =>{
        console.log("Loaded..")
    }
    load_emoji()

    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // const minutesToTime = (minutes) => {
    //     const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    //     const mins = (minutes % 60).toString().padStart(2, '0');
    //     return `${hours}:${mins}`;
    // };

    // Function to initialize the database
    async function initDatabase() {
        try {
            const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` });
            db = new SQL.Database();
            console.log("SQLite Database initialized.");
            createTasksTable(); // Ensure tasks table exists
            
            tasks.forEach(demo_task => {
                insertTask(demo_task);
            });
            
            fetchTasks(); // Fetch tasks after initialization
        } catch (error) {
            console.error("Error initializing SQLite Database:", error);
        }
    }
    initDatabase();

    // Function to create tasks table
    function createTasksTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                startTime TEXT,
                endTime TEXT,
                icon TEXT,
                title TEXT,
                description TEXT,
                checked INTEGER,
                repeat INTEGER,
                repeatDays TEXT,
                taskColor TEXT,
                createdDay TEXT
            )
        `;
        db.exec(createTableQuery);
        console.log("Tasks table created or verified.");
    }

    // Function to fetch tasks from database
    function fetchTasks() {
        if (!db) {
            console.error("Database is not initialized.");
            return;
        }else{
            const query = 'SELECT * FROM tasks';
            const result = db.exec(query);
            const tasks = result[0] ? result[0].values.map(row => ({
                id: row[0],
                startTime: row[1],
                endTime: row[2],
                icon: row[3],
                title: row[4],
                description: row[5],
                checked: row[6],
                repeat: row[7],
                repeatDays: JSON.parse(row[8]),
                taskColor: row[9],
                createdDay: row[10]
            })) : [];
            
            if (result.length > 0) {
                console.log("Tasks fetched successfully:", result[0].values);
            } else {
                console.log("No tasks found.");
            }
            
            return tasks;
        }   
    }

    // Function to insert a task into the database
    function insertTask(task) {
        const insertQuery = `
            INSERT INTO tasks (
                startTime,
                endTime,
                icon,
                title,
                description,
                checked,
                repeat,
                repeatDays,
                taskColor,
                createdDay
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const { startTime, endTime, icon, title, description, checked, repeat, repeatDays, taskColor, createdDay } = task;
        const repeatDaysStr = JSON.stringify(repeatDays);

        try{
            db.run(insertQuery, [
                startTime,
                endTime,
                icon,
                title,
                description,
                checked,
                repeat,
                repeatDaysStr,
                taskColor,
                createdDay
            ]);
            console.log("Task inserted.");
        }
        catch(error){
            console.error("Unsuccessful insert found an error:", error)
        }
    }

    // Function to update a task in the database
    function updateTask(task) {
        const updateQuery = `
            UPDATE tasks SET
                startTime = ?,
                endTime = ?,
                icon = ?,
                title = ?,
                description = ?,
                checked = ?,
                repeat = ?,
                repeatDays = ?,
                taskColor = ?,
                createdDay = ?
            WHERE id = ?
        `;
        const { id, startTime, endTime, icon, title, description, checked, repeat, repeatDays, taskColor, createdDay } = task;
        const repeatDaysStr = JSON.stringify(repeatDays);

        try{
            db.run(updateQuery, [
                startTime,
                endTime,
                icon,
                title,
                description,
                checked,
                repeat,
                repeatDaysStr,
                taskColor,
                createdDay,
                id
            ]);
            console.log("Task updated.");
        }
        catch(error){
            console.error("Unsuccessful update found an error:", error)
        }
    }

    // Function to delete a task from the database
    function deleteTask(id) {
        const deleteQuery = `DELETE FROM tasks WHERE id = ?`;
        try{
            db.run(deleteQuery, [id]);
            console.log("Task deleted!");
        }
        catch(error){
            console.error("Unsuccessful at deleting found an error:", error)
        }
    }

    // function showtasks(){
    //     console.log(event.target)
    //     if (event.target.classList.contains('title')) {
    //       const taskId = event.target.dataset.id;
    //       db.get("SELECT * FROM tasks WHERE id = ?", [taskId], (err, row) => {
    //         if (err) {
    //           console.error(err.message);
    //         } else {
    //           document.getElementById('tasktitle').textContent = row.title;
    //           document.getElementById('taskDescription').value = row.description;
    //           document.getElementById('taskForm').dataset.id = taskId;
    //           const offcanvas = new bootstrap.Offcanvas(document.getElementById('taskDetailsCanvas'));
    //           offcanvas.show();
    //         }
    //       });
    //     }
    // }

    // Function to open task details in offcanvas
    const openTaskDetails = (task) => {
        const _update_repeat = document.getElementById('update-repeat');
        const _update_description = document.getElementById('update-description');
        const _update_title = document.getElementById('update-title');
        const _update_icon = document.getElementById('update-icon');
        const _update_end_time = document.getElementById('update-end-time');
        const _update_start_time = document.getElementById('update-start-time');
        const _update_task_color = document.getElementById('update-task-color');
        const _update_checked = document.getElementById('update-checked');
        const saveTaskButton = document.getElementById('update-task');
        const deleteTaskButton = document.getElementById('delete-task');

        _update_repeat.value = task.repeat
        _update_description.value = task.description
        _update_title.value = task.title
        _update_icon.value = task.icon
        _update_end_time.value = task.endTime
        _update_start_time.value = task.startTime
        _update_task_color.value = task.taskColor
        _update_checked.checked = task.checked

        // Show the offcanvas
        const taskDetailsOffcanvas = new bootstrap.Offcanvas(document.getElementById('taskDetailsOffcanvas'));
        taskDetailsOffcanvas.show();

        // Save task button click event
        saveTaskButton.addEventListener('click', () => {
            task.repeat = _update_repeat.value
            task.description = _update_description.value
            task.title = _update_title.value
            task.icon = _update_icon.value
            task.endTime = _update_end_time.value
            task.startTime = _update_start_time.value
            task.taskColor = _update_task_color.value

            updateTask(task);
            taskDetailsOffcanvas.hide();
            renderTasks(new Date());
        });

        // Delete task button click event
        deleteTaskButton.addEventListener('click', () => {
            deleteTask(task.id);
            taskDetailsOffcanvas.hide();
            renderTasks(new Date());
        });
    };

    // Calender view to display months, dates and year
    const renderCalendar = (year, month) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayIndex = firstDay.getDay();
        const lastDayIndex = lastDay.getDay();

        const daysInMonth = lastDay.getDate();
        const prevMonthDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const nextMonthDays = lastDayIndex === 6 ? 0 : 6 - lastDayIndex;

        calendarDaysContainer.innerHTML = '';

        for (let i = 1 - prevMonthDays; i <= daysInMonth + nextMonthDays; i++) {
            const dayElement = document.createElement('div');
            const date = new Date(year, month, i);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const long_day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateNumber = date.getDate();

            dayElement.classList.add('day');
            if (i < 1 || i > daysInMonth) {
                dayElement.classList.add('disabled');
            }

            dayElement.innerHTML = `<div class="date">${dateNumber}</div><div class="day-name" data-name="${long_day}">${day}</div>`;

            if (i > 0 && i <= daysInMonth) {
                dayElement.addEventListener('click', () => {
                    document.querySelector('.day.selected')?.classList.remove('selected');
                    dayElement.classList.add('selected');
                    updateBadges(date);
                    renderTasks(date);
                });
            }

            calendarDaysContainer.appendChild(dayElement);
        }

        // Set today's date as selected
        const today = new Date();
        if (today.getFullYear() === year && today.getMonth() === month) {
            const todayDate = today.getDate();
            const todayElement = Array.from(calendarDaysContainer.children).find(dayElement => {
                return dayElement.querySelector('.date').textContent == todayDate;
            });
            if (todayElement) {
                console.log("Checking the todayElement",todayElement)
                todayElement.classList.add('currentday');
                todayElement.classList.add('selected');
                // await delay(5000);
                setTimeout(function () {
                    renderTasks(new Date());
                    updateBadges(today);
                }, 3000);
            }
        }

        // Update month and year display
        monthYearDisplay.innerHTML = `
            <button id="prev-month"><i class="fa fa-angle-left" aria-hidden="true"></i></button>
            <span class="month">${months[month]}</span>
            <span class="year">${year}</span>
            <button id="next-month"><i class="fa fa-angle-right" aria-hidden="true"></i></button>
        `;

        // Add event listeners for navigation buttons
        document.getElementById('prev-month').addEventListener('click', () => {
            if (month === 0) {
                currentYear--;
                currentMonth = 11; // December
            } else {
                currentMonth--;
            }
            renderCalendar(currentYear, currentMonth);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            if (month === 11) {
                currentYear++;
                currentMonth = 0; // January
            } else {
                currentMonth++;
            }
            renderCalendar(currentYear, currentMonth);
        });
    };

    const renderTasks = (selectedDate) => {
        const tasks = fetchTasks();
        let selectedDayName = "";
        console.log("Selected Date is:", selectedDate)
    
        if (tasks) {
            taskList.innerHTML = '';
            if (selectedDate != null) {
                selectedDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
            } else {
                selectedDate = document.querySelector('.day.currentday');
                selectedDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
            }
    
            const filteredTasks = tasks.filter(task => {
                const taskCreatedDay = task.createdDay;
                const taskRepeatDays = task.repeatDays;
                return taskCreatedDay == selectedDayName || (task.repeat && taskRepeatDays.includes(selectedDayName));
            });
    
            filteredTasks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
            filteredTasks.forEach((task, index) => {
                if (index > 0) {
                    const previousTask = filteredTasks[index - 1];
                    const previousTaskEnd = timeToMinutes(previousTask.endTime);
                    const currentTaskStart = timeToMinutes(task.startTime);
                    if (currentTaskStart > previousTaskEnd) {
                        const gapElement = document.createElement('div');
                        gapElement.classList.add('gap');
                        gapElement.style.height = `${currentTaskStart - previousTaskEnd}px`;
                        taskList.appendChild(gapElement);
                    }
                }
    
                const taskElement = document.createElement('div');
                taskElement.classList.add('routine');
                if (task.taskColor) {
                    taskElement.style.borderColor = task.taskColor;
                }
    
                taskElement.innerHTML = `
                    <div class="time">
                        <div class="start-time">${task.startTime}</div>
                        <div class="end-time">${task.endTime}</div>
                    </div>
                    <div class="content">
                        <div class="icon" style="background: ${task.taskColor}">
                            <i class="${task.icon}"></i>
                        </div>
                        <div class="details">
                            <div class="title ${task.checked ? 'strikethrough' : ''}" data-id="${task.id}">${task.title}</div>
                            <div class="description ${task.checked ? 'strikethrough' : ''}">${task.description}</div>
                            ${task.repeat ? `<div class="repeat ${task.checked ? 'strikethrough' : ''}">Repeats on: ${task.repeatDays.join(', ')}</div>` : ''}
                        </div>
                        <div class="round">
                            <input type="checkbox" class="checkbox" ${task.checked ? 'checked' : ''} data-index="${task.id}" id="checkbox-${task.id}">
                            <label for="checkbox-${task.id}" ${task.checked ? '':'style="background:' + task.taskColor +'"'}></label>
                        </div>
                    </div>
                `;
    
                taskList.appendChild(taskElement);
            });
    
            // Attach event listeners to the checkboxes after rendering the tasks
            document.querySelectorAll('.checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (event) => {
                    const taskId = event.target.dataset.index;
                    const task = tasks.find(task => task.id == taskId);
                    if (task) {
                        task.checked = event.target.checked;
                        updateTask(task); // Update task in the database
                        renderTasks(selectedDate);
                        updateBadges(selectedDate);
                    }
                });
            });

            // Attach event listeners to the titles to open the modal
            document.querySelectorAll('.routine .details').forEach(title => {
                title.addEventListener('click', (event) => {
                    const taskId = event.target.dataset.id;
                    const task = tasks.find(task => task.id == taskId);
                    console.log(task)
                    openTaskDetails(task)
                });
            });
        }
    };
   
    const updateBadges = (selectedDate) => {
        document.querySelectorAll('.day .badge').forEach(badge => badge.remove());

        const selectedDay = document.querySelector('.day.selected');
        if (!selectedDay) return;

        const selectedDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

        const incompleteTasksCount = tasks.filter(task => !task.checked && (task.createdday === selectedDayName || (task.repeat && task.repeatDays.includes(selectedDayName)))).length;
        console.log("Incompleted tasks:", incompleteTasksCount, selectedDayName)

        let badge = selectedDay.querySelector('.badge');
        if (incompleteTasksCount >= 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge';
                selectedDay.appendChild(badge);
            }
            badge.textContent = incompleteTasksCount;
        } else if (badge) {
            badge.remove();
        }
    };

    renderCalendar(currentYear, currentMonth);

    document.querySelector('.add-routine').addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    repeatCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            repeatDaysContainer.style.display = 'block';
        } else {
            repeatDaysContainer.style.display = 'none';
        }
    });

    routineForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const icon = document.getElementById('icon').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const taskColor = document.getElementById('task-color').value;
        const repeat = document.getElementById('repeat').checked;
        const repeatDays = Array.from(document.querySelectorAll('input[name="repeat-days"]:checked')).map(input => input.value);

        let selectedDate = document.querySelector('.day.selected');
        let createdDay = ""
        if(selectedDate != null){
            createdDay = selectedDate.querySelector('.day-name').textContent;
        }
        else{
            selectedDate = document.querySelector('.day.currentday');
            createdDay = selectedDate.querySelector('.day-name').textContent;
        }

        const newTask = {
            startTime,
            endTime,
            icon,
            title,
            description,
            checked: false,
            repeat,
            repeatDays,
            taskColor,
            createdDay: createdDay
        };

        
        // tasks.push(newTask);
        insertTask(newTask)
        modal.style.display = 'none';
        document.getElementById("myForm").reset();
        renderTasks(selectedDate);
    });

    
    
    // document.getElementById('tasktitle').addEventListener('change', (event) => {
    //     if (event.target.classList.contains('task-checkbox')) {
    //         const taskId = event.target.dataset.id;
    //         const checked = event.target.checked ? 1 : 0;
    //         db.run("UPDATE tasks SET checked = ? WHERE id = ?", [checked, taskId], (err) => {
    //         if (err) {
    //             console.error(err.message);
    //         }
    //         });
    //     }
    // });
    
    // document.getElementById('saveTask').addEventListener('click', () => {
    //     const taskId = document.getElementById('UpdateForm').dataset.id;
    //     const description = document.getElementById('taskDescription').value;
    //     db.run("UPDATE tasks SET description = ? WHERE id = ?", [description, taskId], (err) => {
    //         if (err) {
    //         console.error(err.message);
    //         } else {
    //         loadTasks();
    //         const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('taskDetailsCanvas'));
    //         offcanvas.hide();
    //         }
    //     });
    // });

    // document.getElementById('deleteTask').addEventListener('click', () => {
    //     const taskId = document.getElementById('UpdateForm').dataset.id;
    //     db.run("DELETE FROM tasks WHERE id = ?", [taskId], (err) => {
    //         if (err) {
    //         console.error(err.message);
    //         } else {
    //         loadTasks();
    //         const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('taskDetailsCanvas'));
    //         offcanvas.hide();
    //         }
    //     });
    // });
    
});
    