document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const tasksContainer = document.getElementById('tasks-container');

            if (tasks.length > 0) {
                tasks.forEach(task => {
                    let taskHTML = `
                        <div class="container">
                            <div class="task-card">
                                <h3>${task.title}</h3>
                                <ul id="task-${task._id}" class= "task-grid">
                                    ${Object.entries(task.components).map(([component, details]) => {
                                        const activeWorkers = details.employees.filter(emp => emp.startTime !== null && emp.endTime === null);
                                        
                                        const progress = calculateProgress(details, activeWorkers.length);

                                        // Calculate ETA if completed
                                        let etaText = '';
                                        let progressBarColor = '';

                                        if (details.status === 'completed' && details.startTime && details.endTime) {// if task is done
                                            const timeDiff = (new Date(details.endTime) - new Date(details.startTime))/60000 // convert difference time to minute

                                            // Convert time difference to hours and minutes
                                            const expectedTime = details.fullTime// get full time of work
                                            let eta = 0;

                                            if (timeDiff > expectedTime) {
                                                // Task is late, show the time beyond expected completion
                                                const excessTime = timeDiff - expectedTime // in minutes 
                                                const excessHours = Math.floor(excessTime / 60); // convert the time in hours
                                                const excessMinutes = Math.floor(excessTime % 60); // Get the minutes
                                                eta = `${excessHours}h ${excessMinutes}m beyond`;
                                                progressBarColor = '#f44336'; // Red for overdue
                                            } else {
                                                // Task is completed on time or early
                                                eta = '0h 0m';
                                                progressBarColor = '#4caf50'; // Green for completed on time
                                            }

                                            etaText = `Completed - ETA: ${eta}`;
                                        }
                                        
                                        return `
                                            <li id="task-${task._id}-${component}">
                                                <strong>${component}:</strong> 
                                                Status: ${details.status} 
                                                ${details.startTime ? `| Start Time: ${new Date(details.startTime).toLocaleString()}` : ''}
                                                ${details.endTime ? `| End Time: ${new Date(details.endTime).toLocaleString()}` : ''}
                                                ${details.startTime && details.endTime ? `| Total Time: ${Math.floor((new Date(details.endTime) - new Date(details.startTime)) / 60000)} minutes` : ''}
                                                ${details.fullTime && activeWorkers.length > 0 ? 
                                                    `| Full Task Time: ${(details.fullTime / activeWorkers.length)} minutes` 
                                                    : details.fullTime ? 
                                                        `| Full Task Time: ${details.fullTime} minutes` 
                                                    : ''}
                                                <div class="progress-container-bar">
                                                    <div class="progress-task-bar" style="width: ${Math.min(progress, 100)}%; background-color: ${progressBarColor};">
                                                        <span class="eta-text">${etaText}</span>
                                                    </div>
                                                </div>
                                                <p>Progress: <span id="progress-${task._id}-${component}">${progress.toFixed(2)}%</span></p>
                                                <p>Active Workers: ${activeWorkers.map(worker => worker.name).join(', ') || 'None'}</p>
                                            </li>
                                        `;
                                    }).join('')}
                                </ul>
                                <button class="finalize-btn" data-task-id="${task._id}">Finalize</button>
                            </div>
                        </div>
                    `;
                    tasksContainer.innerHTML += taskHTML;

                    //Add event listener to Finalize
                    const finalizeButton = document.querySelector(`button[data-task-id="${task._id}"]`);
                    finalizeButton.addEventListener('click', () => {
                        fetch('/api/tasks/finalize', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ taskId: task._id }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            alert('Task finalized!');
                            finalizeButton.closest('.container').remove();
                        })
                        .catch(error => {
                            console.error('Error finalizing task:', error);
                            alert('Error finalizing task');
                        });
                    });

                    // Update the progress dynamically
                    setInterval(() => {
                        Object.entries(task.components).forEach(([component, details]) => {
                            const progressBar = document.querySelector(`#task-${task._id}-${component} .progress-task-bar`);
                            const progressText = document.querySelector(`#progress-${task._id}-${component}`);
                            const etaText = document.querySelector(`#task-${task._id}-${component} .eta-text`);
                            const activeWorkers = details.employees.filter(emp => emp.startTime !== null && emp.endTime === null);

                            if (details.status === 'running' && details.startTime) {
                                const progress = calculateProgress(details, activeWorkers.length);

                                if (progressBar) {
                                    progressBar.style.width = `${Math.min(progress, 100)}%`;

                                    // Set the progress bar color based on progress
                                    if (progress < 50) {
                                        progressBar.style.backgroundColor = '#4caf50'; // Green
                                    } else if (progress >= 50 && progress < 75) {
                                        progressBar.style.backgroundColor = '#ffeb3b'; // Yellow
                                    } else {
                                        progressBar.style.backgroundColor = '#f44336'; // Red
                                    }
                                }

                                if (progressText) {
                                    progressText.textContent = `${progress.toFixed(2)}%`;
                                }
                            }

                            if (details.status === 'completed' && details.startTime && details.endTime && etaText) {
                                const timeDiff = (new Date(details.endTime) - new Date(details.startTime))/60000; // convert to minutes

                                const expectedTime = details.fullTime  // get full time in minutes
                                let eta = '0h 0m';

                                if (timeDiff > expectedTime) {
                                    const excessTime = timeDiff - expectedTime // in minutes 
                                    const excessHours = Math.floor(excessTime / 60); // convert the time in hours
                                    const excessMinutes = Math.floor(excessTime % 60); // Get the minutes
                                    eta = `${excessHours}h ${excessMinutes}m beyond`;
                                }

                                etaText.textContent = `Completed - ETA: ${eta}`;
                                if (eta !== '0h 0m') {
                                    progressBar.style.backgroundColor = '#f44336';
                                }
                            }
                        });
                    }, 1000); // Update every second
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
