const mongoose = require('mongoose');

const Maintenance = new mongoose.Schema({ // doesn't require timesr
    title: {
        type: String,
        required: true,
    },
    components: {
        startTime: { type: Date, default: null },
        endTime: { type: Date, default: null },
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
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', Maintenance);
