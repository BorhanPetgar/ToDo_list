const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
// const { TodoListUser, Task } = require('./models/users');
const { Task, User } = require('./models/usersInfo');
const session = require('express-session');
const flash = require('connect-flash');

const port = 3001

// express  app
const app = express();

// connect to mongodb
const db = 'mongodb+srv://borhan:12345@cluster0.jtvwzaf.mongodb.net/?retryWrites=true&w=majority'

app.set('view engine', 'ejs');

app.use(express.static('public'));
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

app.get('/todo', (req, res) => {
    // res.render('todo');
    const username = req.session.username;
    User.find({ username }) // Find the user by username
        .then((user) => {
            const task = user[0].tasks; // Retrieve the tasks array from the user

            // Render the `todo` view with the updated task list
            res.render('todo', {
                tittle: "Home",
                task: task
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


            User.find()
                .then((task) =>
                    res.render('todo', {
                        tittle: "Home",
                        task: task
                    })
                )
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/create-task', (req, res) => {
    const { description, category, date, priority } = req.body;

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
                priority: priority
            });

            user.tasks.push(newTask);

            // Save the updated user document
            return user.save();
        })
        .then(() => {
            console.log('Task created successfully');

            // Retrieve the updated task list for the user
            User.find({ username }) // Find the user by username
                .then((user) => {
                    const task = user[0].tasks; // Retrieve the tasks array from the user

                    // Render the `todo` view with the updated task list
                    res.render('todo', {
                        tittle: "Home",
                        task: task
                    });
                })
                .catch((err) => {
                    console.log('Error retrieving task:', err);
                    return res.status(500).json({ error: 'An error occurred while retrieving the task' });
                });
        })
        .catch((err) => {
            console.log('Error creating task:', err);
            return res.status(500).json({ error: 'An error occurred while creating the task' });
        });
});

// app.get('/delete-task', async (req, res) => {
//     try {
//         const ids = Object.keys(req.query);
//         console.log(ids);

//         for (let i = 0; i < ids.length; i++) {
//             await Task.findByIdAndDelete(ids[i]);
//         }
//         res.redirect('/todo');
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ error: 'An error occurred while deleting the task' });
//     }
// });

app.delete('/delete-task', (req, res) => {
    const id = req.params.id;
    console.log(id);

    Task.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/todo' });
        })
        .catch(err => {
            console.log(err);
        });
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

  app.post('/update-task', (req, res) => { 
    const taskId = req.body.id; 
    const { description, category, date } = req.body; 
   
    Task.findByIdAndUpdate(taskId, { description, category, date }) 
      .then((task) => { 
        res.redirect('/todo'); 
      }) 
      .catch((err) => { 
        console.log('error in updating task', err); 
        return res.status(500).json({ error: 'An error occurred while updating the task' }); 
      }); 
  }); 