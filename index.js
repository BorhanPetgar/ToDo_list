const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

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
    // Perform signup logic here
    
    // Redirect to the root path
    res.redirect('/');
});