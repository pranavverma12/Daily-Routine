// script.js
let tasks = []

let db = null; // Declare db variable globally

document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const calendarDaysContainer = document.querySelector('.days');
    const monthYearDisplay = document.querySelector('.month-year');
    const modal = document.getElementById('routine-modal');
    const closeButton = document.querySelector('.close-button');
    const routineForm = document.getElementById('routine-form');
    const repeatCheckbox = document.getElementById('new-repeat');
    const repeatDaysContainer = document.getElementById('new-repeat-days-container');

    const today = new Date();
    const today_local = today.toLocaleDateString('en-IN')
    const today_long_day = today.toLocaleDateString('en-IN', { weekday: 'long' });
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const load_emoji = () =>{
        console.log("Loaded..", tasks)
    }
    load_emoji()

    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    fetch('data.json')
    .then(response => response.json())
    .then(data => 
        tasks=data["tasks"]
    )
    .catch(error => console.error("Error fetching JSON data:", error));

    // const minutesToTime = (minutes) => {
    //     const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    //     const mins = (minutes % 60).toString().padStart(2, '0');
    //     return `${hours}:${mins}`;
    // };

    // Function to initialize the database
    async function initDatabase() {
        try {
            const sqlPromise  = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` });

            const dataPromise = fetch("sqlite.db").then(res => res.arrayBuffer());
            const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
            db = new SQL.Database(new Uint8Array(buf));

            // db = new SQL.Database();
            console.log("SQLite Database initialized.");
            createTasksTable(); // Ensure tasks table exists
            console.log("init data", tasks)
            
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
                createdDate TEXT
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
                createdDate: row[10]
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
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const { startTime, endTime, icon, title, description, checked, repeat, repeatDays, taskColor, createdDate } = task;
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
                createdDate
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
                createdDate = ?
            WHERE id = ?
        `;
        const { id, startTime, endTime, icon, title, description, checked, repeat, repeatDays, taskColor, createdDate } = task;
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
                createdDate,
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
        const _update_created_date = document.getElementById('update-created-date');
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
        _update_created_date.value = task.createdDate

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
            renderTasks([today_local,today_long_day]);
        });

        // Delete task button click event
        deleteTaskButton.addEventListener('click', () => {
            deleteTask(task.id);
            taskDetailsOffcanvas.hide();
            renderTasks([today_local,today_long_day]);
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

        for (let i = 1-prevMonthDays; i <= daysInMonth + nextMonthDays; i++) {
            const dayElement = document.createElement('div');
            const date = new Date(year, month, i);
            const day = date.toLocaleDateString('en-IN', { weekday: 'short' });
            const long_day = date.toLocaleDateString('en-IN', { weekday: 'long' });
            const full_date = date.toLocaleDateString('en-IN')
            const dateNumber = date.getDate();

            dayElement.classList.add('day');
            if (i < 1 || i > daysInMonth) {
                dayElement.classList.add('disabled');
            }

            dayElement.innerHTML = `<div class="date" data-name="${full_date}">${dateNumber}</div><div class="day-name" data-name="${long_day}">${day}</div>`;

            if (i > 0 && i <= daysInMonth) {
                dayElement.addEventListener('click', () => {
                    document.querySelector('.day.selected')?.classList.remove('selected');
                    dayElement.classList.add('selected');
                    updateBadges([full_date, long_day]);
                    renderTasks([full_date, long_day]);
                });
            }

            calendarDaysContainer.appendChild(dayElement);
        }

        // Set today's date as selected
        if (today.getFullYear() === year && today.getMonth() === month) {
            const todayDate = today.getDate();
            const todayElement = Array.from(calendarDaysContainer.children).find(dayElement => {
                return dayElement.querySelector('.date').textContent == todayDate;
            });
            if (todayElement) {
                todayElement.classList.add('currentday');
                todayElement.classList.add('selected');
                setTimeout(function () {
                    renderTasks([today_local, today_long_day]);
                    updateBadges([today_local, today_long_day]);
                }, 2000);
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

    renderCalendar(currentYear, currentMonth);

    const renderTasks = (selectedDate) => {
        const tasks = fetchTasks();
        let selectedDayName = "";
    
        if (tasks) {
            taskList.innerHTML = '';
            if (selectedDate != "") {
                selectedDayDate = selectedDate[0]
                selectedDayName = selectedDate[1]
            } else {
                selectedDate = document.querySelector('.day.currentday');
                selectedDayDate = document.querySelector('.day.currentday .date').innerText
                selectedDayName = document.querySelector('.day.currentday .datyname').dataset.name
            }
    
            const filteredTasks = tasks.filter(task => {
                const taskCreatedDate = task.createdDate;
                const taskRepeatDays = task.repeatDays;
                return (taskCreatedDate == selectedDayDate || (task.repeat && taskRepeatDays.includes(selectedDayName)))
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
                        updateBadges([today_local, today_long_day]);
                        renderTasks([today_local, today_long_day]);
                    }
                });
            });

            // Attach event listeners to the titles to open the modal
            document.querySelectorAll('.routine .details').forEach(title => {
                title.addEventListener('click', (event) => {
                    const taskId = event.target.dataset.id;
                    const task = tasks.find(task => task.id == taskId);
                    openTaskDetails(task)
                });
            });
        }
    };
   
    // Update the badges on top of calendar dates
    const updateBadges = (selectedDate) => {
        document.querySelectorAll('.day .badge').forEach(badge => badge.remove());

        const selectedDay = document.querySelector('.day.selected');
        if (!selectedDay) return;

        let selectedDayDate = selectedDate[0]
        let selectedDayName = selectedDate[1]

        const incompleteTasksCount = tasks.filter(task => !task.checked && (task.createdDate === selectedDayDate || (task.repeat && task.repeatDays.includes(selectedDayName)))).length;

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

    // Function to add the new task on routine
    document.querySelector('.add-routine').addEventListener('click', () => {
        modal.style.display = 'block';
        let _today_datetime = today
        let _today_date = _today_datetime.toISOString().toLocaleString().slice(0,10)
        let _today_time = _today_datetime.toLocaleTimeString('en-in', { hour12: false })
        console.log(_today_date, _today_time)
        document.getElementById('new-created-date').value = _today_date
        document.getElementById('new-created-date').min = _today_date
        document.getElementById('new-start-time').value = _today_time
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        console.log(modal.form);
        modal.getElementsByTagName("form")[0].reset();
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

        const startTime = document.getElementById('new-start-time').value;
        const endTime = document.getElementById('new-end-time').value;
        const icon = document.getElementById('new-icon').value;
        const title = document.getElementById('new-title').value;
        const description = document.getElementById('new-description').value;
        const taskColor = document.getElementById('new-task-color').value;
        const repeat = document.getElementById('new-repeat').checked;
        const repeatDays = Array.from(document.querySelectorAll('input[name="repeat-days"]:checked')).map(input => input.value);

        let selectedDate = document.querySelector('.day.selected');
        let createdDate = ""
        if(selectedDate != null){
            createdDate = selectedDate.querySelector('.day-name').textContent;
        }
        else{
            createdDate = today.toISOString().slice(0, 10);
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
            createdDate: createdDate
        };

        // tasks.push(newTask);
        insertTask(newTask)
        modal.style.display = 'none';        
        modal.getElementsByTagName("form")[0].reset()
        renderTasks([today_local, today_long_day]);
    });
});
    