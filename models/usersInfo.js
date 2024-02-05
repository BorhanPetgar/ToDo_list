const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: String,
  category: String,
  date: {
    type: Date,
    get: function (value) {
      // Custom getter function to format the date as "Monday, Feb 25, 2024"
      const options = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };

      return value.toLocaleString(undefined, options);
    }
  },
  priority: String, 
  complete: { type: Boolean, default: false },
  reminder: {
    type: Date,
    get: function (value) {
      // Custom getter function to format the date as "Monday, Feb 25, 2024"
      const options = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };

      return value.toLocaleString(undefined, options);
    }
  },
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  tasks: [taskSchema], // Define tasks as an array of taskSchema
});

const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Task, User };