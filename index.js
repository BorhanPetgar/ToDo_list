const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { TodoListUser, Task } = require('./models/users');


const port = 3001
// express  app
const app = express();

// connect to mongodb
const db = 'mongodb+srv://borhan:12345@cluster0.jtvwzaf.mongodb.net/?retryWrites=true&w=majority'

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(morgan('dev'))
app.use(express.urlencoded({extended:false}))

mongoose.connect(db)
    .then((result) => app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    }))
    .catch((err) => console.log(err));


app.get('/', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')

})

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
  
    // Create a new todo list user instance
    const user = new TodoListUser({
      username,
      password
    });
  
    // Save the user to the database
    user.save()
      .then((savedUser) => {
        // Create a new task associated with the user
        const task = new Task({
          description: 'Your task description',
          user: savedUser._id, // Assign the user's ObjectId to the task's user field
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