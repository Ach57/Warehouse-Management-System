const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  priorityTask: { type: String, default: 'low'},
  components: {
    metalFabrication: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, //  Total time 
      fullTime: {type: Number, default: 0}, // Total time of the task
      totalTime: {type: String, default: null}, // difference between end time and start time
      status: { type: String, default: "pending" }, // pending, running, completed
      employees: {
        type: [
          {
            name: { type: String },
            startTime: { type: Date },
            endTime: { type: Date, default: null },
            contribution: { type: String, default: null },
            comment: { type: String, default: null },
          }
        ],
        default: [], // Ensures this field is always an array
      },
    },
    paint: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true },
      fullTime: {type: Number, default: 0}, // Total time of the task
      totalTime: {type: String, default: null},
      status: { type: String, default: "pending" },
      employees: {
        type: [
          {
            name: { type: String },
            startTime: { type: Date },
            endTime: { type: Date, default: null },
            contribution: { type: String, default: null },
            comment: { type: String, default: null },
          }
        ],
        default: [], // Ensures this field is always an array
      },

    },
    assembly: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      fullTime: {type: Number, default: 0}, // Total time of the task
      totalTime: {type: String, default: null}, // difference between end time and start time
      status: { type: String, default: "pending" },
      employees: {
        type: [
          {
            name: { type: String },
            startTime: { type: Date },
            endTime: { type: Date, default: null },
            contribution: { type: String, default: null },
            comment: { type: String, default: null },
          }
        ],
        default: [], // Ensures this field is always an array
      },

    },
    shipping: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      time: { type: Number, required: true }, // in hours
      fullTime: {type: Number, default: 0}, // Total time of the task
      totalTime: {type: String, default: null}, // difference between end time and start time
      status: { type: String, default: "pending" },
      employees: {
        type: [
          {
            name: { type: String },
            startTime: { type: Date },
            endTime: { type: Date, default: null },
            contribution: { type: String, default: null },
            comment: { type: String, default: null },
          }
        ],
        default: [], // Ensures this field is always an array
      },

    },
  },
  createdAt: {
    type: Date,
    default : Date.now,
  },
});

module.exports = mongoose.model('Task', taskSchema);
