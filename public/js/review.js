// Function to fetch and display completed tasks
async function loadCompletedTasks() {
    try {
        const response = await fetch('/api/completed-tasks');
        const completedTasks = await response.json();

        const container = document.getElementById('completed-tasks-container');
        container.innerHTML = ''; // Clear previous content

        if (!response.ok) {
            container.innerHTML = '<p>No completed tasks to review.</p>';
            return;
        }

        completedTasks.forEach(task => {
            const taskHtml = `
                <div class="completed-task-card">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-components-review">
                        ${Object.keys(task.components).map(component => {
                            const comp = task.components[component];

                            // Calculate time spent if startTime and endTime are present
                            let timeSpent = 'N/A';
                            if (comp.startTime && comp.endTime) {
                                const start = new Date(comp.startTime);
                                const end = new Date(comp.endTime);
                                const diffInMinutes = Math.floor((end - start) / 60000); // Difference in minutes
                                timeSpent = `${diffInMinutes} minutes`;

                                // Calculate total time (could be different for each component, so calculate here)
                                const totalTime = `${Math.floor(diffInMinutes / 60)} hours ${diffInMinutes % 60} minutes`;
                                comp.totalTime = totalTime;  // Set the calculated totalTime
                            }

                            // Format employee list
                            const employeeNames = comp.employees && comp.employees.length > 0 
                                ? comp.employees.map(emp => emp.name).join(', ') 
                                : 'No employees assigned';

                            return `
                                <div class="component-card-review">
                                    <p class="component-title-review">${component}</p>
                                    <p><strong>Time Spent:</strong> ${timeSpent}</p>
                                    <p><strong>Status:</strong> ${comp.status}</p>
                                    <p><strong>Time Set:</strong> ${comp.fullTime ? `${comp.fullTime} minutes` : 'N/A'}</p>
                                    <p><strong>Total time of work:</strong> ${comp.totalTime || 'N/A'}</p>
                                    <p><strong>Employees:</strong> ${employeeNames}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            container.innerHTML += taskHtml;
        });
    } catch (error) {
        console.error('Error loading completed tasks:', error);
        document.getElementById('completed-tasks-container').innerHTML = '<p>Error loading tasks.</p>';
    }
}

// Load completed tasks when the page is loaded
window.onload = loadCompletedTasks;
