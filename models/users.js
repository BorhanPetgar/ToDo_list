const mongoose = require('mongoose');

// Define the Task schema
const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TodoListUser',
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

// Define the Todo List Users schema
const todoListUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create the model for the Todo List Users schema
const TodoListUser = mongoose.model('TodoListUser', todoListUserSchema);
const Task = mongoose.model('Task', taskSchema);

module.exports = { TodoListUser, Task };