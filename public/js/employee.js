// Function to fetch tasks from the server
async function loadTasks() {
    try {
        const response = await fetch('/employee/tasks');
        const tasks = await response.json();
        
        const taskContainer = document.getElementById('task-container');
        taskContainer.innerHTML = ''; // Clear previous tasks
        
        tasks.forEach((task) => {
            let taskHtml = `
                <div class="task">
                    <h3>${task.title}</h3>
            `;

            Object.keys(task.components).forEach((component) => {
                const comp = task.components[component];
                taskHtml += `
                    <div class="task-component">
                        <p class="component-status">${component} - Status: ${comp.status}</p>
                        <div class="timer-bar">
                            <p class="time-left">Time Left: ${comp.time} hours</p>
                        </div>
                        ${comp.status === 'pending' ? 
                            `<button class="start-button" onclick="startTask('${task._id}', '${component}')">Start</button>` 
                            : ''}
                        ${comp.status === 'running' ? 
                            `<button class="finish-button" onclick="finishTask('${task._id}', '${component}', this.parentElement.querySelector('.time-left'))">Finish</button>` 
                            : ''}
                    </div>
                `;
            });

            taskHtml += `</div>`; // Close task div
            taskContainer.innerHTML += taskHtml; // Append task to the container
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Start the task timer
async function startTask(taskId, component) {
    try {
        const response = await fetch(`/employee/tasks/${taskId}/${component}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            const { task } = await response.json();
            loadTasks(); // Reload tasks to show updated status
            startTimer(taskId, component); // Start the countdown timer
        } else {
            const result = await response.json();
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error starting task:', error);
    }
}

// Timer logic (removes progress bar, just keeps countdown)
async function startTimer(taskId, component) {
    const timeLeftElem = document.querySelector(`#${taskId}-${component} .time-left`);

    // Assuming you have a total time for the task (in minutes)
    const totalTime = 60; // Example: 60 minutes
    let remainingTime = totalTime * 60; // Convert minutes to seconds

    while (remainingTime > 0) {
        // Wait for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        remainingTime -= 1; // Decrease time every second

        // Update the time left text
        const minutesLeft = Math.floor(remainingTime / 60);
        const secondsLeft = remainingTime % 60;
        timeLeftElem.innerText = `Time Left: ${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
    }

    // When time is up, update UI
    timeLeftElem.innerText = 'Task Completed!';
}

// Mark the task as finished and log the time spent
async function finishTask(taskId, component, timeSpentElem) {
    const timeSpent = timeSpentElem.innerText; // Fetch the time spent from the element
    //Prompt user for additional inputs
    const employees = prompt('Enter the employees involved (comma-separated):');
    const comment = prompt('Add your comment to this task');

    try {
        const response = await fetch(`/employee/tasks/${taskId}/${component}/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timeSpent,
                comment: comment || "", // Default to empty string if no comment is provided
                employees: employees ? employees.split(',').map(emp => emp.trim()) : [], // Split and trim input
            }),
        });

        if (response.ok) {
            const { task } = await response.json();
            loadTasks(); // Reload tasks to show updated status
        } else {
            const result = await response.json();
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error finishing task:', error);
    }
};

let orderId = null;
let maintOrderId = null;

document.getElementById('startMaintenance').addEventListener('click', async function(){
    const startTime = new Date();
    const title = prompt('Enter the title for the maintenance');
    const employeeName = prompt('Enter your employee names seperated by comma').split(',');

    const componets = {
        startTime: startTime,
        endTime : null,
        employees: employeeName,
        comment: null,
    }

    const data = {
        title: title,
        components: [componets],
    }

    // Send the data to log it in the database
    const response = await fetch('/maintenance/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const result = await response.json();
        maintOrderId = result.order._id;  // Store the order ID for future updates
        console.log('Order logged:', result);
        // Toggle the buttons
        document.getElementById('startMaintenance').hidden = true;
        document.getElementById('endMaintenance').hidden = false;
    } else {
        alert('Error logging the order.');
    }

});



document.getElementById('startSeperate').addEventListener('click', async function (){
    const startTime = new Date(); // set starting time usind date

    const title = prompt('Enter The title for the seperate Order please');
    const employeeName = prompt('Enter your employee names seperated by comma').split(',');


    const components = {
        startTime: startTime,
        endTime: null,
        employees: employeeName,
        comment: null,
    }

    const data = {
        title: title,
        components: [components],

    };

   // Send the data to log it in the database
   const response = await fetch('/seperateOrder/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const result = await response.json();
        orderId = result.order._id;  // Store the order ID for future updates
        console.log('Order logged:', result);
        // Toggle the buttons
        document.getElementById('startSeperate').hidden = true;
        document.getElementById('endSeperate').hidden = false;
    } else {
        alert('Error logging the order.');
    }


});

document.getElementById('endMaintenance').addEventListener('click', async function(){
    const comment = prompt('Enter a comment');
    const endTime =  new Date();

    const updatedData = {
        components: {
            endTime: endTime,
            comment: comment,
        },
    };

    // Send the data to update the order in the database
    const response = await fetch(`/maintenance/end/${maintOrderId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    });

    if (response.ok) {
        alert('Order updated successfully!');
        // Reset the form and UI
        document.getElementById('startMaintenance').hidden = false;
        document.getElementById('endMaintenance').hidden = true;
    } else {
        alert('Error updating the order.');
    }


});


document.getElementById('endSeperate').addEventListener('click', async function () {
    const comment = prompt('Enter a comment');
    const endTime = new Date();  // Set the end time

    // Prepare the data to update the order
    const updatedData = {
        components: {
            endTime: endTime,
            comment: comment,
        },
    };

    // Send the data to update the order in the database
    const response = await fetch(`/seperateOrder/end/${orderId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    });

    if (response.ok) {
        alert('Order updated successfully!');
        // Reset the form and UI
        document.getElementById('startSeperate').hidden = false;
        document.getElementById('endSeperate').hidden = true;
    } else {
        alert('Error updating the order.');
    }
});


window.onload = loadTasks;
