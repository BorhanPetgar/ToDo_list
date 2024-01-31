const mongoose = require('mongoose');

// Define the Task schema
const taskSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
});


// Create the model for the Todo List Users schema
const Task = mongoose.model('Task', taskSchema);

module.exports = {Task};