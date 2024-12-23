// Function to fetch and display completed tasks
async function loadCompletedTasks() {
    try {
        const response = await fetch('/api/completed-tasks');
        const completedTasks = await response.json();
        
        const container = document.getElementById('completed-tasks-container');
        container.innerHTML = ''; // Clear previous content

        if (completedTasks.length === 0) {
            container.innerHTML = '<p>No completed tasks to review.</p>';
            return;
        }

        completedTasks.forEach(task => {
            const taskHtml = `
                <div class="completed-task-card">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-components">
                        ${Object.keys(task.components).map(component => {
                            const comp = task.components[component];

                            // Calculate time spent if startTime and endTime are present
                            let timeSpent = 'N/A';
                            if (comp.startTime && comp.endTime) {
                                const start = new Date(comp.startTime);
                                const end = new Date(comp.endTime);
                                const diffInMinutes = Math.floor((end - start) / 60000); // Difference in minutes
                                timeSpent = `${diffInMinutes} minutes`;
                            }

                            return `
                                <div class="component-card">
                                    <p class="component-title">${component}</p>
                                    <p><strong>Time Spent:</strong> ${timeSpent}</p>
                                    <p><strong>Status:</strong> ${comp.status}</p>
                                    <p><strong>Time Set:</strong> ${comp.time || 'N/A'}</p>
                                    <p><strong>Employees:</strong> ${comp.employees && comp.employees.length > 0 ? comp.employees.join(', ') : 'No employees assigned'}</p>
                                    <p><strong>Comment:</strong> ${comp.comment || 'No comment'}</p>
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