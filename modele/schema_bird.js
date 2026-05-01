const mongoose = require("mongoose");

const birdSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: [true, "Où as été vu cet oiseau ?"] },
    date: { type: String, required: [true, "Quand as été vu cet oiseau ?"] },
    urlImage: { type: String, required: false }
});

module.exports = mongoose.model("Bird", birdSchema);