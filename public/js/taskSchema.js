const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  components: {
    metalFabrication: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      status: { type: String, default: "pending" }, // pending, running, completed
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
    paint: {
      time: { type: Number, required: true },
      status: { type: String, default: "pending" },
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
    assembly: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      status: { type: String, default: "pending" },
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
    shipping: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      status: { type: String, default: "pending" },
      employees: [{ type: String }], // List of employees assigned to this component
      comment: { type: String, default: null },  // Optional comment
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', taskSchema);
