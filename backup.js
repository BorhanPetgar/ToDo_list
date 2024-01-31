const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
// const { TodoListUser, Task } = require('./models/users');
const {Task} = require('./models/usersInfo');
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
app.use(express.urlencoded({extended:false}))
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  }));
  
app.use(flash());

mongoose.connect(db)
    .then((result) => app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    }))
    .catch((err) => console.log(err));


app.get('/', (req, res) => {
    res.render('login')
})

app.get('/todo', (req, res) => {
    res.render('todo');
});

app.get('/signup', (req, res) => {
    res.render('signup')

})

app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    TodoListUser.findOne({ username })
    .then((existingUser) => {
        if (existingUser) {
            // Display an error message if the username is already taken
            console.log('Username is already taken');
            return res.render('signup', { error: 'Username is already taken' });
        }

        // Create a new todo list user instance
        const user = new TodoListUser({
            username,
            password,
        });

        // Save the user to the database
        console.log(req.body);
        return user.save();


    })
    .then((savedUser) => {
        // Create a new task associated with the user
        const task = new Task({
        description: 'Your task description',
        user: savedUser._id,
        });

        // Save the task to the database
        return task.save();
    })
    .then(() => {
        // Redirect to the root path
        res.redirect('/');
    })
    .catch((err) => {
        console.log(err);
        // Handle any error that occurs during saving the user or task
        // Redirect or display an error message to the user
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('USERNAME:', username);
    console.log('PASSWORD:', password);

    // Find the user with the provided username and password
    TodoListUser.findOne({ username, password })
    .then((user) => {
        console.log('USER:', user);
        if (!user) {
            // Handle invalid login credentials
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }

        // Redirect the user to the todo page after successful login
        res.render('todo', {
            tittle: "Home"
            // task: task
        });
    })
    .catch((err) => {
        console.log(err);
        // Handle any error that occurs during the login process
        // Redirect or display an error message to the user
    });
});