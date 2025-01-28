require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10; // Number of salt rounds for bcrypt
const cookieParser = require('cookie-parser'); // cookie parser
const User = require('./public/js/user');
const Task = require('./public/js/taskSchema')
const CompletedTask = require('./public/js/completedTask')
const SeperateOrder = require('./public/js/seperate');
const Maintenance = require('./public/js/maintenance');

const { default: mongoose } = require('mongoose');
const {updateUserRole} = require('./public/js/updateRole');
const http = require('http')
const socketIo = require('socket.io')


const app = express();
const server = http.createServer(app)
const io = socketIo(server)
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/IndoTechDB';

const confirmedTasks =[]

// Connect to MongoDB using Mongoose
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('Could not connect to MongoDB Atlas...', err);
        process.exit(1); // Exit the process if the connection fails
    });


//Use cookie-parser
app.use(cookieParser());

app.use(bodyParser.json())

//Set the view enjine to EJS
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded bodies (e.g., from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies (e.g., from AJAX requests)
app.use(express.json());


//set the directory for EJS templates
app.set('views', path.join(__dirname, 'EJS'));


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//Routes

// Middleware to check for cookie expiration and set status to offline
app.use(async (req, res, next) => {
    const loggedIn = req.cookies.loggedIn;
    const username = req.cookies.username;

    if (!loggedIn && username) {
        // If the loggedIn cookie is missing, set the user status to offline
        await User.findOneAndUpdate({ username }, { status: 'offline' });
        res.clearCookie('username'); // Clear the username cookie as well
    }
    
    next();
});

app.get('/employee/username', (req, res)=>{
    const username = req.cookies.username;
    if(username){
        res.json({username});
    }else{
        res.status(401).json({error: 'User not found'});
    }
});

app.post('/assignTask', async (req, res) => {
    try {
        // Capture form data from the request body
        const { 
            taskTitle, 
            metalFabricationTime, // time of work
            paintTime,  // time of work
            assemblyTime, // time of work
            shippingTime, // time of work
        } = req.body;

        // Create a new task based on the schema
        const newTask = new Task({
            title: taskTitle,
            components: {
                metalFabrication: {
                    time: metalFabricationTime ? parseFloat(metalFabricationTime) * 60 : 0, // convert to minute
                    fullTime: metalFabricationTime ? parseFloat(metalFabricationTime) * 60 : 0,
                    status: 'pending',
                },
                paint: {
                    time: paintTime ? parseFloat(paintTime) * 60 : 0, // convert to min
                    fullTime: metalFabricationTime ? parseFloat(paintTime) * 60 : 0,
                    status: 'pending',
                },
                assembly: {
                    time: assemblyTime ? parseFloat(assemblyTime) * 60 : 0, // convert to min
                    fullTime: metalFabricationTime ? parseFloat(assemblyTime) * 60 : 0,
                    status: 'pending',
                },
                shipping: {
                    time: shippingTime ? parseFloat(shippingTime) * 60 : 0, // convert to min
                    fullTime: metalFabricationTime ? parseFloat(shippingTime) * 60 : 0,
                    status: 'pending',
                },
            },
        });

        const savedTask = await newTask.save();

        // Redirect after saving the task
        res.redirect('/manageDashboard?success=true');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving task' });
    }
});



app.get('/', async (req, res) => {
    
    const loggedIn = req.cookies.loggedIn
    if (loggedIn) {
        const username = req.cookies.username;
        try {
            const user = await User.findOne({ username });

            if (user) {
                // Redirect based on user role
                if (user.role === 'admin' ) {
                    return res.render('admin', {username: username,
                        isLoggedIn:true, message: ''
                    } );
                } else if (user.role === 'employee') {
                    return res.render('employee', {username: username,
                        isLoggedIn:true, message: ''});
                }
            }
        } catch (err) {
            console.error('Error finding user:', err);
        }
    }

    // If not logged in, render the login/register page
    res.render('index', { registerMessage: '',
         loginMessage: '',
        isLoggedIn:false,
        forgot_pass_message: '' });
});

app.post('/register', async (req, res)=>{
     // Handle registration logic here
    try{
        const { username, email, id ,password, role } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] }); // find if the user already exists

        if( existingUser){
            return res.render('index', {registerMessage: 'Username or email already in use',
                loginMessage: '', isLoggedIn: false, forgot_pass_message:''
            });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            email,
            id,
            password: hashedPassword,
            role: role|| 'employee', //default role is set to employee
        });

        await newUser.save(); // await until the newUser is saved
        
        // Render the registration page with a success message
        res.render('index', { registerMessage: 'User registered successfully',
            loginMessage: '',
            isLoggedIn:false,
            forgot_pass_message:'',
         });

    } catch(error){
        // if an error occurs during the operation
        console.error('Registration error:', error);
        res.render('index', { registerMessage: 'Error registering user',
            loginMessage: '',
            isLoggedIn:false,
            forgot_pass_message:''

         });
    }


});

app.get('/admin', (req, res)=>{
    const username = req.cookies.username;
    const loggedIn = req.cookies.username;
    if (loggedIn) {
        // Render the admin page and pass the username to the template
        res.redirect('/');
        
    }else{
        // If the username cookie doesn't exist, redirect to the login page or handle it accordingly
        res.render('index', { registerMessage: '',
        loginMessage: '',
        isLoggedIn:false,
        forgot_pass_message: ''
     });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();  // Fetch all tasks from the database
        res.json(tasks);  // Return the tasks as a JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



app.post('/addadmin', async (req, res) => {
    const loggedIn = req.cookies.loggedIn;
    const username = req.cookies.username;

    if (loggedIn) {
        const targetUsername  = req.body.newAdmin; // Only need the target username from the form
        if(targetUsername === username){
            return  res.render('admin', {username: username,
                isLoggedIn:true, message: "You are already set to Admin" });
        }
        const newRole = 'admin'; // Hardcode the new role as 'admin'

        const result = await updateUserRole(targetUsername, newRole);

        // Render a page with the message
        res.render('admin', {username: username,
            isLoggedIn:true, message: result.message });
    } else {
        // Redirect to the login page if not logged in
        res.redirect('/');
    }
});

app.get('/manageEmployee', async (req, res) => {
    const username = req.cookies.username;
    const loggedIn = req.cookies.loggedIn;

    if (loggedIn) {
        try {
            // Fetch employees from the database (filter by 'employee' role)
            const employees = await User.find({ role: 'employee' });

            // Render the manageEmployee page and pass employees and username to the view
            res.render('manageEmployee', { 
                username: username, 
                employees: employees,
            });
        } catch (error) {
            console.error('Error fetching employees:', error);
            res.status(500).send('Server error');
        }
    } else {
        res.render('index', { 
            registerMessage: '',
            loginMessage: '',
            isLoggedIn: false,
            forgot_pass_message: ''
        });
    }
});

app.post('/deleteEmployee', async (req, res) => {
    const { employeeId } = req.body; // Get the employee ID from the form submission

    try {
        // Find and delete the employee by their ID
        await User.findByIdAndDelete(employeeId);

        // After deletion, redirect back to the manageEmployee page
        res.redirect('/manageEmployee');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('Server error');
    }
});

app.post('/addEmployee', async (req, res) => {
    const { username, email, id, password } = req.body;

    try {
        // Check if the employee already exists by email or ID
        const existingEmployee = await User.findOne({ $or: [{ email: email }, { id: id }] });
        if (existingEmployee) {
            res.redirect('/manageEmployee')
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new employee
        const newEmployee = new User({
            username,
            email,
            id,
            password: hashedPassword,
            role: 'employee'  // Assigning 'employee' role
        });

        // Save the employee to the database
        await newEmployee.save();

        // Redirect to the manage employee page with a success message
        res.redirect('/manageEmployee')
    } catch (error) {
        console.error('Error adding employee:', error);
        res.render('manageEmployee', { 
            username: req.cookies.username, 
            errorMessage: 'An error occurred while adding the employee.' 
        });
    }
});

app.get('/manageDashboard',(req, res)=>{
    const username = req.cookies.username;
    const loggedIn = req.cookies.loggedIn;
    // Check if the success query parameter is present
    const successMessage = req.query.success ? 'Task assigned successfully!' : '';  
    if(loggedIn){
        res.render('manageDashboard', {username: username, successMessage})
    }else{
        res.render('index', { registerMessage: '',
            loginMessage: '',
            isLoggedIn:false,
            forgot_pass_message: ''
         });
    }


});



app.get('/Review',(req, res)=>{
    const loggedIn = req.cookies.loggedIn;
    const username = req.cookies.username;

    if(loggedIn){
        const tasksToShow = [...confirmedTasks]
        confirmedTasks.length = 0;
        res.render('Review', {username: username, tasks:tasksToShow})
    }else{
        res.render('index', { registerMessage: '',
            loginMessage: '',
            isLoggedIn:false,
            forgot_pass_message: ''
         });
    }

})

app.get('/api/completed-tasks', async (req, res) => {
    try {
        // Fetch all completed tasks from the CompletedTask model
        const completedTasks = await CompletedTask.find();
        
        if (!completedTasks || completedTasks.length === 0) {
            return res.status(404).json({ message: 'No completed tasks found.' });
        }
        
        res.json(completedTasks);
    } catch (error) {
        console.error('Error fetching completed tasks:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/employeeDash', (req, res)=>{
    const loggedIn = req.cookies.loggedIn;
    const username = req.cookies.username;
    if (loggedIn){
        res.render('employee', {username: username})
    }else{
        res.render('index', { registerMessage: '',
            loginMessage: '',
            isLoggedIn:false,
            forgot_pass_message: ''
         });
    }
});

app.post("/api/insertData", async (req, res)=>{
    console.log("Request body:", req.body);

    try {
        const taskData = req.body;
    
        const task  = new Task(taskData);

        await task.save();

        res.status(200).json({ message: "Task saved successfully" }); 
    

    }catch(error){
        console.error("Server error:", error);
        res.status(500).send({ message: "Error saving task data", error });

    }


})


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.render('index', { registerMessage: '', loginMessage: 'User not found',
                isLoggedIn:false, forgot_pass_message: ''});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('index', { registerMessage: '', loginMessage: 'Incorrect password',
                isLoggedIn:false, forgot_pass_message: ''
             });
        }

        await User.findOneAndUpdate({username}, {status:'online'}) // set status of user to online in the database

        // Set a logged-in cookie
        const cookieOptions = {
            maxAge: 60 * 60 * 1000, 
            httpOnly: true,
        };
        res.cookie('loggedIn', true, cookieOptions);
        res.cookie('username', username, cookieOptions);

        // Redirect based on user role
        if (user.role === 'admin') {
            res.redirect('/');
        } else if (user.role === 'employee') {
            res.redirect('/');
        } else {
            res.render('index', { registerMessage: '', loginMessage: 'User role not recognized',
                isLoggedIn:false, forgot_pass_message: ''
             });
        }

    } catch (error) {
        console.error('Login Error: ', error);
        res.render('index', { registerMessage: '', loginMessage: 'Error Logging user',
            isLoggedIn:false, forgot_pass_message: ''
         });
    }
});

app.get('/attendance', async (req, res) => {
    const { 'employee-id': employeeId, action } = req.query;

    // Validate required fields
    if (!employeeId || !action) {
        return res.status(400).send('Employee ID and Punch Type are required!');
    }

    try {
        // Create a new punch record
        const punch = new Punch({
            id: employeeId,
            punchType: action // 'punch-in' or 'punch-out' from form
        });

        await punch.save(); // Save to database
        res.send(`Punch recorded successfully: ${action} at ${punch.punchTime}`);
    } catch (err) {
        res.status(500).send(`Error recording punch: ${err.message}`);
    }
});

app.post('/seperateOrder/start', async(req, res)=>{
    try {
        const {title, components} = req.body;
        if (!title || !components || components.length === 0) {
            return res.status(400).json({ error: 'Invalid data received' });
        }

        const newOrder = new SeperateOrder({
            title,
            components: {
                startTime: components.startTime,
                endTime: components.endTime,
                timeTaken: components.timeTaken,
                employees: components.employees, 
                comment: components.comment,
            },
        });


        await newOrder.save();
        res.status(201).json({ message: 'Order started and logged', order: newOrder });

    } catch(err){

        console.error('Error logging order:', err);
        res.status(500).json({ error: 'Internal server error' });

    }
});

app.post('/maintenance/start', async (req, res)=>{
    try{

        const {title, components} = req.body;
        if(!title || !components || components.length ===0){
            return res.status(400).json({error: "Invalid data received"});

        }

        const newOrder = new Maintenance({title, components});
        await newOrder.save();
        res.status(201).json({ message: 'Order started and logged', order: newOrder });

    } catch(err){
        console.log('Error logging order: ', err);
        res.status(500).json({error: 'Internal server error'});
    }

});

app.get('/maintenance/get', async(req, res)=>{
    try{

        const order = await Maintenance.findOne({
            "components.startTime": { $ne: null },  // startTime is not null
            "components.endTime": null,  // endTime is null
        })

        if (!order) {
            return res.status(404).json({ message: "No active separate order found for this employee." });
        }

        res.json({order:order});
    

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})

    }

});


app.post('/maintenance/add', async (req, res) =>{
    try{
        const employeeData = req.body;
        const order = await Maintenance.findOne({
            "components.startTime": { $ne: null },  // startTime is not null
            "components.endTime": null  // endTime is null
        })

        if (!order){
            return res.status(404).json({ message: "No active separate order found for this employee." });  
        }

        order.components.employees.push(employeeData);
        await order.save();
        res.status(200).json({ message: 'Employee added successfully' });

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }

});

app.get('/seperateOrder/get', async (req, res)=>{
    try{
        const employeeName = req.query.employeeName;
        if (!employeeName) {
            return res.status(400).json({ message: "Employee name is required." });
        }
        const order = await SeperateOrder.findOne({
            "components.employees": employeeName,
            "components.startTime": { $ne: null },  // startTime is not null
            "components.endTime": null  // endTime is null
        });
        if (!order) {
            return res.status(404).json({ message: "No active separate order found for this employee." });
        }
        res.json({ orderId: order._id });
        

    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Server error" });


    }


});


app.patch('/seperateOrder/end/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { components } = req.body;
        const order = await SeperateOrder.findById(id);
        const timeDiff = new Date(components.endTime) - new Date(order.components.startTime)
        const hours = Math.floor(timeDiff / 1000 / 60 / 60);
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        order.components.endTime = components.endTime
        order.components.comment = components.comment
        order.components.timeTaken = `${hours} hours ${minutes} minutes`;

        await order.save();
        res.status(200).json({ message: 'Order updated successfully'});


        
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/maintenance/end/:id', async (req, res) => {
    try {
        const { _id, name, endTime, contribution, comment } = req.body;

        const order = await Maintenance.findById(_id);
        if (!order) {
            return res.status(404).json({ message: "No active maintenance order found." });
        }

        // Find the employee and update their data
        const employee = order.components.employees.find(emp => emp.name === name);
        if (employee) {
            employee.endTime = endTime;
            employee.contribution = contribution;
            employee.comment = comment;
        }

        const allEmployeeComplete = order.components.employees.every(emp => emp.endTime);

        if (allEmployeeComplete){

            order.components.endTime = endTime;

        }
        await order.save();

        res.status(200).json({ message: "Maintenance task updated successfully" });
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.get('/logout', async (req,res)=>{
    const loggedIn = req.cookies.loggedIn;
    const username = req.cookies.username;
    
    if(loggedIn){
        //clear the cookie:
        await User.findOneAndUpdate({username}, {status:'offline'}) ; // set status of user offline
        res.clearCookie('loggedIn');
        res.clearCookie('username');
    }
    res.redirect('/');
});


// Fetch tasks for the Employee Dashboard
app.get('/employee/tasks', async (req, res) => {
    try {
        const tasks = await Task.find(); // Fetch tasks from DB
        res.json(tasks); // Return tasks as JSON
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to load tasks' });
    }
});

// Backend route for starting the task
app.post('/employee/tasks/:taskId/:component/start', async (req, res) => {
    const { taskId, component } = req.params;
    const { employeeName, startTime } = req.body; // Extract employee info and start time from the request

    try {
        // Find the task by ID
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Find the specified component
        const comp = task.components[component];
        if (!comp) {
            return res.status(404).json({ message: 'Component not found' });
        }

        // Check if the employee is already in the list
        const employeeExists = comp.employees.some(emp => emp.name === employeeName);
        if (!employeeExists) {
            comp.employees.push({
                name: employeeName,
                startTime: new Date(startTime),
                contribution: 0,
                comment: null, // Can be updated later
            });
        }

        // Update the status of the component to 'running'
        if (comp.status !="running"){
            comp.status = 'running';
        }
        if(comp.startTime=== null){
            comp.startTime = new Date();
        }
        
        const timeOfWork = Math.round((new Date() - comp.startTime)/60000); // time of execution in min

        const activeWorkers = comp.employees.filter(emp => emp.startTime!==null & emp.endTime===null);

        if (timeOfWork > comp.fullTime ){
            comp.time = 0; // set this to 0 incase the time passed more than it should
        }else{

            const remainingTime = Math.round((comp.fullTime - timeOfWork)/activeWorkers.length);// get the new time and divde it by the current number of active works
            comp.time = remainingTime;
        }

        // Save the updated task
        await task.save();

        // Return the updated task in the response
        res.json({ task });
    } catch (error) {
        console.error('Error starting task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Finish the task component
app.post('/employee/tasks/:taskId/:component/finish', async (req, res) => {
    const { taskId, component } = req.params; // taskId and component (e.g., 'metalFabrication')
    const { userName, timeSpent, comment } = req.body; // Data from the frontend

    try{
        const task = await Task.findById(taskId);

        const taskComponent = task.components[component];

        const employee = taskComponent.employees.find(emp => emp.name === userName);
        if(employee){
            employee.endTime = new Date(timeSpent);
            const contributionInMinutes = Math.round((employee.endTime - employee.startTime) / 60000); // Rounded to the nearest minute
            employee.contribution =  `${contributionInMinutes} minute${contributionInMinutes !== 1 ? 's' : ''}`;
            employee.comment = comment || "";   
            const allFinished = taskComponent.employees.every(emp => emp.endTime !== null);
            if (allFinished){ // all finished 
                taskComponent.status = 'completed';
                taskComponent.endTime = new Date();
                const timeSpentTotally = Math.round((taskComponent.endTime - taskComponent.startTime)/ 60000); // in minutes
                taskComponent.totalTime = `${timeSpentTotally} minute${timeSpentTotally !== 1 ? 's' : ''} - Completed`;
                taskComponent.time = timeSpentTotally;
            }else{ // in case the last one didn't click on finish 
                const activeWorkers = taskComponent.employees.filter(emp => emp.startTime!==null & emp.endTime ===null); // get list of all active employees
                const timeOfWork = Math.round((new Date() - taskComponent.startTime)/60000) // GET TIME IN MINUTE of what is done

                if (timeOfWork>taskComponent.time){
                    taskComponent.time = 0 // means they team did more than they should
                }else{
                    const remainingTime = Math.round((taskComponent.fullTime - timeOfWork)/activeWorkers.length)
                    taskComponent.time = remainingTime;
                }


            }
        
            await task.save(); // Save the updated task
            res.json({ task });


        }else{
            res.status(404).json({ message: 'Employee not found in task component' });

        }


    } catch(error){
        
        res.status(500).json({message: 'Error finishing task', error});
    }

});


app.post('/api/tasks/finalize', async (req, res) => {
    const taskId = req.body.taskId;
    try {
        // Find the task by ID
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        // Remove task from "Tasks" collection
        await Task.findByIdAndDelete(taskId);

        // Copy task data to a new CompletedTask document
        const completedTask = new CompletedTask(task.toObject());

        // Insert the task into the "Completed Tasks" collection
        await completedTask.save();

        res.status(200).send({ message: 'Task finalized successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error finalizing task', error });
    }
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
  });



