const mongoose = require('mongoose');

const Maintenance = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    components: [{
        startTime: { type: Date, default: null },
        endTime: { type: Date, default: null },
        employees: [{ type: String }],
        comment: { type: String, default: null },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', Maintenance);
