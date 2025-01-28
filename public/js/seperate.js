const mongoose = require('mongoose');

const seperateOrder = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    components: {
        startTime: { type: Date, default: null },
        endTime: { type: Date, default: null },
        timeTaken: {type: String, default: ""},
        employees: {type: String, required:true},
        comment: { type: String, default: null },
    },
}, { timestamps: true });

module.exports = mongoose.model('SeperateOrder', seperateOrder);
