let mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('category', categorySchema);