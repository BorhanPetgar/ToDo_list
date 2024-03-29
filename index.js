const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Task, User } = require('./models/usersInfo');
const session = require('express-session');
const flash = require('connect-flash');

// const { TodoListUser, Task } = require('./models/users');
const port = 3001

// express  app
const app = express();

// connect to mongodb
const db = // mongoDB

app.set('view engine', 'ejs');

app.disable('etag');

app.use(express.static('public'));
app.use(express.static('assets'));
app.use(express.json());
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());

mongoose.connect(db)
    .then((result) => app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    }))
    .catch((err) => console.log(err));


app.get('/', (req, res) => {
    res.render('login')
})



app.get('/todo/:username', (req, res) => {
    // res.render('todo');
    const username = req.session.username;
    User.find({ username }) // Find the user by username
        .then((user) => {
            const task = user[0].tasks; // Retrieve the tasks array from the user

            // Render the `todo` view with the updated task list
            res.render('todo', {
                tittle: "Home",
                task: task,
                username: username
            });
        })
        .catch((err) => {
            console.log('Error retrieving task:', err);
            return res.status(500).json({ error: 'An error occurred while retrieving the task' });
        });
});

app.get('/signup', (req, res) => {
    res.render('signup')

})

app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    User.findOne({ username })
        .then((existingUser) => {
            if (existingUser) {
                console.log('Username is already taken');
                return res.render('signup', { error: 'Username is already taken' });
            }

            // Create a new user with an empty tasks array
            const user = new User({
                username,
                password,
                tasks: [], // Initialize tasks as an empty array
            });

            // Save the user to the database
            return user.save();
        })
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('USERNAME:', username);
    console.log('PASSWORD:', password);

    User.findOne({ username, password })
        .then((user) => {
            console.log('USER:', user);
            if (!user) {
                // Handle invalid login credentials
                req.flash('error', 'Invalid username or password');
                return res.redirect('/login');
            }
            req.session.username = username;
            req.session.password = password;


            // User.find()
            //     .then((task) =>
            //         res.render('todo', {
            //             tittle: "Home",
            //             task: task
            //         })
            //     )
            res.redirect(`/todo/${username}`)
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/create-task', (req, res) => {
    const { description, category, date, priority, reminder } = req.body;
    // Retrieve the username from the session
    const username = req.session.username;

    console.log(`(Before) User = ${username}`);

    // Find the user based on the username
    User.findOne({ username })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            console.log(`User = ${user}`);
            // Create a new task and add it to the user's tasks array
            const newTask = new Task({
                username: username, // Make sure to include the username field
                description: description,
                category: category,
                date: date,
                priority: priority,
                reminder: reminder
            });

            user.tasks.push(newTask);

            // Save the updated user document
            return user.save();
        })
        .then(() => {
            console.log('Task created successfully');

            // Retrieve the updated task list for the user
            res.redirect(`/todo/${username}`)
            // User.find({ username }) // Find the user by username
            //     .then((user) => {
            //         const task = user[0].tasks; // Retrieve the tasks array from the user

            //         // Render the `todo` view with the updated task list
            //         res.render('todo', {
            //             tittle: "Home",
            //             task: task
            //         });
            //     })
            // .catch((err) => {
            //     console.log('Error retrieving task:', err);
            //     return res.status(500).json({ error: 'An error occurred while retrieving the task' });
            // });
        })
        .catch((err) => {
            console.log('Error creating task:', err);
            return res.status(500).json({ error: 'An error occurred while creating the task' });
        });
});

app.delete('/delete-task/:id', (req, res) => {
    const id = req.params.id;
    const username = req.headers.username;

    // Define an async function to handle the deletion
    const deleteTask = async () => {
        try {
            // Find the user by username
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Find the index of the task in the tasks array
            const taskIndex = user.tasks.findIndex(task => task._id.toString() === id);

            if (taskIndex === -1) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Remove the task from the tasks array
            user.tasks.splice(taskIndex, 1);

            // Save the updated user
            await user.save();

            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Call the async function
    deleteTask();
});

app.put('/edit-task/:id', (req, res) => {
    const id = req.params.id;
    const username = req.headers.username;
    const editedTask = req.body;

    // Define an async function to handle the update
    const updateTask = async () => {
        try {
            // Find the user by username
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Find the task in the user's tasks array
            const task = user.tasks.find((task) => task._id.toString() === id);

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Update the task properties
            task.description = editedTask.description;
            task.category = editedTask.category;
            task.deadline = editedTask.deadline;
            task.priority = editedTask.priority;
            task.reminder = editedTask.reminder;

            // Save the updated user
            await user.save();

            res.status(200).json({ message: 'Task updated successfully' });
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Call the async function
    updateTask();
});

app.get('/edit-task', (req, res) => {
    const taskId = req.query.id;

    Task.findById(taskId)
        .then((task) => {
            res.render('edit-task', { task: task });
        })
        .catch((err) => {
            console.log('error in finding task', err);
            return res.status(500).json({ error: 'An error occurred while finding the task' });
        });
});

app.put('/toggle-task-completion/:id/:username', async (req, res) => {
    const taskId = req.params.id;
    // console.log(taskId);
    const { complete } = req.body;
    console.log(taskId);
    console.log(complete);
    try {
        // Find the task by ID and update the complete field
        const task = await Task.findByIdAndUpdate(taskId, { complete }, { new: true });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task completion status updated successfully' });
    } catch (error) {
        console.error('Error updating task completion status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/complete-task/:id', (req, res) => {
    const id = req.params.id;
    const username = req.headers.username;
    const complete = req.body.complete;

    // Define an async function to handle the task update
    const completeTask = async () => {
        try {
            // Find the user by username
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Find the task by id in the user's tasks array
            const task = user.tasks.id(id);

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Update the complete field of the task
            task.complete = complete;

            // Save the updated user
            await user.save();

            res.status(200).json({ message: 'Task updated successfully' });
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Call the async function
    completeTask();
});


app.get('/completed-tasks-list/:username', (req, res) => {
    console.log(req.body, req.params.username, req.headers.username);
    res.render('completed-list');
    console.log('next');
});

// app.get('/completed-list', (req, res) => {
//     res.render('completed-list');
// });

app.get('/todo/list-completed/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const completedTasks = user.tasks.filter(task => task.complete === true);

        res.render('list', {
            completedTasks,
            username
        });

        // res.render('list-completed', {
        //     tittle: "Home",
        //     completedTasks: completedTasks,
        //     username: username
        // });
        console.log(completedTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/todo/list-completed', (req, res) => {
    // res.render('list-completed');
    res.render('list', {
        completedTasks,
        username
    });
});

app.get('/tasks/:username', async (req, res) => {
    const sortOption = req.query.sort || 'category'; // Default sort option is 'category'
    const username = req.params.username;
    const user = await User.findOne({ username }).exec();

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    let tasks;
    if (sortOption === 'priority') {
        tasks = await user.tasks.sort({ priority: 1 });
    } else {
        tasks = await user.tasks.sort({ category: 1 });
    }

    res.render('sort-tasks.ejs', { tasks, username });
});

// app.put('/tasks/:taskId', (req, res) => {
//     const taskId = req.params.taskId;
//     const updatedTask = req.body;

//     // Update the task in the database using Mongoose
//     Task.findByIdAndUpdate(taskId, updatedTask, { new: true }, (err, task) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send('Failed to update task');
//         } else {
//             res.sendStatus(200);
//         }
//     });
// });


// app.put('/edit-task/:id', (req, res) => {
//     const id = req.params.id;
//     const username = req.headers.username;
//     const editedTask = req.body;
//     console.log(id);

//     // Define an async function to handle the update
//     const updateTask = async () => {
//         try {
//             // Find the user by username
//             const user = await User.findOne({ username });

//             if (!user) {
//                 return res.status(404).json({ error: 'User not found' });
//             }

//             // Find the task in the user's tasks array
//             const task = user.tasks.find((task) => task._id.toString() === id);

//             if (!task) {
//                 return res.status(404).json({ error: 'Task not found' });
//             }

//             // Update the task properties
//             task.description = editedTask.description;
//             task.category = editedTask.category;
//             task.deadline = editedTask.deadline;
//             task.priority = editedTask.priority;
//             task.reminder = editedTask.reminder;

//             // Save the updated user
//             await user.save();

//             res.status(200).json({ message: 'Task updated successfully' });
//         } catch (error) {
//             console.error('Error updating task:', error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     };

//     // Call the async function
//     updateTask();
// });

app.patch('/update-task/:id', async (req, res) => {
    try {
        // const { taskId } = req.params;
        const { taskId, field, value, username} = req.body;
        console.log('update task part');
        console.log(value);
        // Find the task by ID
        const user = await User.findOne({ username });
        const task = await user.tasks.id(taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the specific field of the task
        task[field] = value;

        // Save the updated task
        const updatedTask = await user.save();

        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'An error occurred while updating the task' });
    }
});
