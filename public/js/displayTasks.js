document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const tasksContainer = document.getElementById('tasks-container');

            if (tasks.length > 0) {
                tasks.forEach(task => {
                    let taskHTML = `
                    <div class="container-display - ${task._id}">
                        <div class="task-card-display">
                            <h3>${task.title}</h3>
                            <table class="progress-table">
                                <thead>
                                    <tr>
                                        ${Object.keys(task.components).map(component => `<th>${component}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        ${Object.entries(task.components).map(([component, details]) => {
                                            const progress = calculateProgress(details, details.employees.filter(emp => emp.startTime !== null && emp.endTime === null).length);
                                            const activeWorkers = details.employees.filter(emp => emp.startTime != null && emp.endTime === null)
                                            let workerNames = '';
                                            if (activeWorkers.length >0){
                                                workerNames = activeWorkers.map(emp => emp.name).join(',')
                                            }
                                            let eta = 0;
                                            const totalTime = details.totalTime //get total time
                                            const getFullTime = details.fullTime; // Get full time of the task in minutes
                                            const getStartingTime = details.startTime ;
                                            const getEndTime = details.endTime;
                                            if (getFullTime !=0 && getEndTime!==null){ // means task requires a timer and task is done
                                                const timeSpent = Math.round((new Date(getEndTime) - new Date(getStartingTime))/60000) // convert to min
                                                if (getFullTime<timeSpent){
                                                    eta = Math.abs(getFullTime - timeSpent);
                                                }
                                            } // calculate the eta

                                            return `
                                                <td id = "task-${task._id}-${component}">
                                                    <div class="progress-container-display">
                                                        <div class="progress-bar-display" style="width: ${Math.min(progress, 100)}%; background-color: ${
                                                progress < 50 ? '#4caf50' : progress < 75 ? '#ffeb3b' : '#f44336'
                                            };">
                                                        </div>
                                                        <span id = "progress-${task._id}-${component}">${progress.toFixed(2)}%</span>
                                                    </div>
                                                    <div class = "mini-info-container">
                                                        <p> Active Workers: ${workerNames}</p>
                                                        <p> ETA: ${eta} minute${eta > 1 ? 's' : ''}</p>
                                                        ${totalTime != null ? `<p> Total Time spent: ${totalTime}</p>` : ''}
                                                    </div>
                                                </td>
                                            `;
                                        }).join('')}
                                        <button class="finalize-btn" id="finalize-btn-${task._id}" data-task-id="${task._id}" onclick="finalize('${task._id}')">Finalize</button>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    `;
                    tasksContainer.innerHTML += taskHTML;

                    // Update the progress dynamically
                    setInterval(() => {

                        Object.entries(task.components).forEach(([component, details], index) => {

                            const progress = calculateProgress(details, details.employees.filter(emp => emp.startTime !== null && emp.endTime === null).length);
                            // Get the corresponding progress bar and text
                            const progressBar = document.querySelector(`#task-${task._id}-${component} .progress-bar-display`);
                            const progressText = document.querySelector(`#progress-${task._id}-${component}`);                            
                    
                            // Update the progress bar and the text
                            
                            if (progressBar) {
                                
                                progressBar.style.width = `${Math.min(progress, 100)}%`;
                                progressBar.style.backgroundColor = progress < 50 ? '#4caf50' : progress < 75 ? '#ffeb3b' : '#f44336';
                            }
                    
                            if (progressText) {
                                progressText.textContent = `${progress.toFixed(2)}%`;
                            }
                            
                        });

                    }, 1000);

                });
            } else {
                tasksContainer.innerHTML = "<p>No projects available at the moment.</p>";
            }
        })
        .catch(error => console.error('Error fetching tasks:', error));
});

// Function to calculate progress
function calculateProgress(details, activeWorkerCount) {
    let progress = 0;
    if (details.status === 'completed') {
        progress = 100;
    } else if (details.status === 'running' && details.startTime) {
        const startTime = new Date(details.startTime);
        const currentTime = new Date();
        const elapsedTime = (currentTime - startTime) / 60000; // in minutes 
        if (activeWorkerCount > 0) {
            progress = (elapsedTime / (details.fullTime/activeWorkerCount)) * 100; // calculate progress based on time
        }
    }
    return progress;
}


function finalize(taskId){

    fetch('/api/tasks/finalize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: taskId }),
    })
    .then(response => response.json())
    .then(data => {
        alert('Task finalized!');
        const taskElement = document.getElementById(`finalize-btn-${taskId}`).closest('.container-display');
        taskElement.remove();
    })
    .catch(error => {
        console.error('Error finalizing task:', error);
        alert('Error finalizing task');
    });


}

