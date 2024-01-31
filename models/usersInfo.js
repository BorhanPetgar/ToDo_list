// const mongoose = require('mongoose');

// // Define the Task schema
// const taskSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         // unique: true,
//     },
//     password: {
//         type: String,
//     },
//     description: {
//         type: String
//         // required: true,
//     },
//     completed: {
//         type: Boolean
//         // default: false,
//     },
//     category: {
//         type: String
//         // required: true
//     },
//     date: {
//         type: Date
//         // required: true
//     },
//     priority: {
//         type: String
//         // required: true
//     },
// });


// // Create the model for the Todo List Users schema
// const Task = mongoose.model('Task', taskSchema);

// module.exports = {Task};

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: String,
  category: String,
  date: Date,
  priority: String, //
  complete: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  tasks: [taskSchema], // Define tasks as an array of taskSchema
});

const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Task, User };