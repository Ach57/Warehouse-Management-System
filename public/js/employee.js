// Function to fetch tasks from the server
async function loadTasks() {
    const username = await getUsername();
    if(!username) {
        alert('Error: User is not logged in. Please log in and try again.');   
        return; // stop if username is not found
    }
    try {
        const response = await fetch('/employee/tasks'); //Fetches the tasks in the dataBase
        const tasks = await response.json();
        
        const taskContainer = document.getElementById('task-container');
        taskContainer.innerHTML = ''; // Clear previous tasks
        
        tasks.forEach((task) => {
            let taskHtml = `
                <div class="task">
                    <h3>${task.title} - ${task.priorityTask}</h3>
            `;
            let componentsHtml = ''

            Object.keys(task.components).forEach((component) => {
                const comp = task.components[component];
                let statusText = `Status: ${comp.status}`;
                let startButton = '';
                let finishButton = '';
                const currentWorkers = comp.employees
                const taskFinished = comp.status;
                
                if(taskFinished!=='completed'){ // check if task is already finished or not
                    const employee = comp.employees.find(emp => emp.name ===username); // Replace with dynamic employee name
                    if (employee){
                        const isTaskDone = comp.employees.find(emp => (emp.name === username && emp.endTime!==null)) // Check if user finished task or not
                    
                        if(!isTaskDone){
                            // If the employee is part of the component
                            finishButton = `<button class="finish-button" onclick="finishTask('${task._id}', '${component}')">Finish</button>`;
                        }
                        
                    }else{
                        // If the user is not in comp.employees, show the "start" button
                        startButton = `<button class="start-button" onclick="startTask('${task._id}', '${component}')">Start</button>`;

                    }
                }
                

                // Generate the employee list html
                let employeesHtml = '<ul class="employee-list">';
                currentWorkers.forEach(worker => {
                    const status = worker.endTime ? 'Finished' : 'Working';
                    employeesHtml += `<li>${worker.name} - ${status}</li>`;
                });
                employeesHtml += '</ul>';

                componentsHtml += `
                    <div class="task-component">
                        <p class="component-status">${component} - ${statusText}</p>
                        <div class="timer-bar">
                            <p class="time-left">Total Time: ${comp.time} minute${comp.time !== 1 ? 's' : ''}</p>
                        </div>
                        ${employeesHtml}
                        ${startButton}
                        ${finishButton}
                    </div>
                `;

            });

            taskHtml += `
        <div class="task-components-container">
            ${componentsHtml}
        </div>
    `; // Close task div
            taskContainer.innerHTML += taskHtml; // Append task to the container
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Start the task timer
async function startTask(taskId, component) {
    const username = await getUsername();
    if(!username){
        alert('Unable to find user name');
        return
    }
    try {

        // Send a POST request to the backend
        const response = await fetch(`/employee/tasks/${taskId}/${component}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeName: username , // Username dynamically fetched
                startTime: new Date().toISOString(), // Send the current time in ISO format
            }),
        });
        if (response.ok) {
            loadTasks()
        } else {
            const result = await response.json();
            alert(`Error: ${result.message}`); // Show error if task couldn't be started
        }
    } catch (error) {
        console.error('Error starting task:', error);
    }
}


// Mark the task as finished and log the time spent
async function finishTask(taskId, component) {
    const username = await getUsername();
    const timeSpent = new Date().toISOString(); // Time spent on the task
    const comment = prompt('Add your comment to this task:').trim() || ""; // Prompt for a comment

    try {
        // Send the finish request to the backend
        const response = await fetch(`/employee/tasks/${taskId}/${component}/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: username,   // Identify the user by name
                timeSpent,  // Time spent by the user
                comment,    // User-provided comment
            }),
        });

        if (response.ok) {
            const { task } = await response.json();

            // Update logic for task completion
            const allFinished = task.components[component].employees.every(employee => employee.endTime !== null);

            if (allFinished) {
                alert('All users have finished the task. Marking it as complete.');
                loadTasks(); // Reload tasks to show updated status
            } else {
                alert('Your part of the task has been marked as finished.');
                loadTasks(); // Reload tasks to show updated status
            }
        } else {
            const result = await response.json();
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error finishing task:', error);
        alert('An unexpected error occurred while finishing the task.');
    }
}


async function getUsername() {

    try {
        const response = await fetch('/employee/username');
        if (response.ok) {
            const data = await response.json();
            return data.username;
        } else {
            throw new Error('Failed to fetch username');
        }
    } catch (error) {
        console.error('Error fetching username:', error);
        return null; // Fallback if username can't be fetched
    }

}


async function  loadMaintenance() {
    const button = document.getElementById('toggleMaintenance');
    const employeeName = await getUsername();
    const getMaintenanceTask = await fetch ('/maintenance/get',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if(getMaintenanceTask.ok){
        const taskData = await getMaintenanceTask.json();
        const filterEmployee = taskData.order.components.employees.find(emp => emp.name === employeeName);
        if(filterEmployee && !filterEmployee.endTime){
            button.textContent = 'Finish';
        }

    }
    
    
}

document.getElementById('toggleMaintenance').addEventListener('click', async function(){
    const button = this
    const employeeName  = await getUsername();
    if (button.textContent==="Start"){
        const getMaintenanceTask = await fetch ('/maintenance/get',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (getMaintenanceTask.ok){ // in case people are working on a task 
            const taskData = await getMaintenanceTask.json();
            const employeeInfo = taskData.order.components.employees;
            const check = employeeInfo.find(emp=> emp.name == employeeName && emp.startTime!==null & emp.endTime!==null)
            if(check){
                alert('You have already worked on the maintenance. You must wait for the other team.')
            }else{
                const employeeStartTime = new Date();
            const employeeData= {
                name: employeeName,
                startTime: employeeStartTime,
                endTime: null,
                contribution: null, 
                comment: null
            }
            const response = await fetch(`/maintenance/add`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employeeData)

            })
            if(response.ok){
                button.textContent ='Finish';
            }else{
                const errorData = await response.json();
                alert(errorData.message || 'Some issue happened when adding you to the maintenance team');

            }
            }
            

        } else{ // first user is about to start maintenance since task not found
            const startTime = new Date();
            
            const title = prompt('Enter the title for the maintenance');

            const components = {
                startTime: startTime,
                endTime : null,
                employees: [{
                    name: employeeName,
                    startTime: startTime,
                    endTime: null,
                    contribution: null,
                    comment: null
                    }
                ],
                
            }
            const data = {
                title: title,
                components: components
            }

                // Send the data to log it in the database
                const response = await fetch('/maintenance/start', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok){
                    button.textContent= "Finish";
                }else{
                    alert('Error starting Maintenance')
                }
            }

    } else if(button.textContent =='Finish'){ // in case the user exists and is working on the maintenance
        // have to check if he is the last to click finish or not
        const getMaintenanceTask = await fetch ('/maintenance/get',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (getMaintenanceTask.ok){ // get the task and now verify if the user within the employees list
            // check if its final employee 

            const taskData = await getMaintenanceTask.json();
            const employees = taskData.order.components.employees;

            const otherEmployees = employees.filter(employee => employee.name !== employeeName);

            const allOtherEmployeesComplete = otherEmployees.every(employee => {
                return employee.startTime && employee.endTime;
            });

            if (allOtherEmployeesComplete){ // if everyone but him finished
                const endTime = new Date();
                const timeDiff = Math.round((endTime - new Date(taskData.order.components.startTime))/60000) // convert to minutes
                const comment = prompt('Enter a comment regarding the maintennce');
                const contribution = `Time Spent ${timeDiff} Min`  
                const response = await fetch(`/maintenance/end/${taskData.order._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: taskData.order._id,
                        name: employeeName,
                        endTime: endTime,
                        contribution: contribution,
                        comment: comment,
                    })
                });

                if (response.ok){
                    button.textContent = 'Start';
                }else{
                    alert('Issue in finializing the task')
                }


            }else{ // not everyone finished

                const endTime = new Date();
                const timeDiff = Math.round((endTime - new Date(taskData.order.startTime))/60000) // convert to minutes
                const comment = prompt('Enter a comment regarding the maintennce');
                const contribution = `Time Spent ${timeDiff} Min`  

                const response = await fetch(`/maintenance/end/${taskData.order._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: taskData.order._id,
                        name: employeeName,
                        endTime: endTime,
                        contribution: contribution,
                        comment: comment,
                    })

                });

                if(response.ok){

                    button.textContent = 'Start';
                }else{
                    alert('Issue finalizing contribution');
                }
                
            }


        }


    }
    

});



async function loadingSeperate(){
    const button = document.getElementById('toggleSeperate');
    const employeeName = await getUsername();
    const getOrderId = await fetch(`/seperateOrder/get?employeeName=${encodeURIComponent(employeeName)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (getOrderId.ok){ // if there is an order id exisitng
        button.textContent = "Finish"

    }

}

document.getElementById('toggleSeperate').addEventListener('click', async function (){

    const button = this;
    const employeeName = await getUsername();

    if (button.textContent ==="Start"){
        const startTime = new Date(); // set starting time usind date

        const title = prompt('Enter The title for the seperate Order please');
        
    
        const components = {
            startTime: startTime,
            endTime: null,
            timeTaken:"",
            employees: employeeName,
            comment: null,
        }
    
        const data = {
            title: title,
            components: components,
    
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
            // Toggle the buttons
            button.textContent ="Finish";
        } else {
            console.error('Error sending data:', error);
            alert('Error logging the order.');
        }
    } else if( button.textContent==="Finish"){
        const comment = prompt('Enter a comment regarding the seperate order:');
        const endTime = new Date();  // Set the end time
        // Prepare the data to update the order
        const updatedData = {
            components: {
                endTime: endTime,
                comment: comment,
            },
        };
        // get the orderID here:
        const getOrderId = await fetch(`/seperateOrder/get?employeeName=${encodeURIComponent(employeeName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (getOrderId.ok){
            const response = await getOrderId.json();
            orderId = response.orderId;
        }

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
            button.textContent= "Start";
        } else {
            alert('Error updating the order.');
        }

    }

});




window.onload = function(){
    loadingSeperate();
    loadMaintenance();
    loadTasks();
    
}
