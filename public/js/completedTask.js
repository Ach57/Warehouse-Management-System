const mongoose = require('mongoose');

const completedTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  components: {
    metalFabrication: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      status: { type: String, default: "completed" }, // completed
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
    paint: {
      time: { type: Number, required: true },
      status: { type: String, default: "completed" },
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
    assembly: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      status: { type: String, default: "completed" },
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
    shipping: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      status: { type: String, default: "completed" },
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: Date.now, // Automatically set to the time when the task is marked as completed
  },
});

module.exports = mongoose.model('CompletedTask', completedTaskSchema);
