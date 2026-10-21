const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  titolo: { type: String, required: true },
  completato: { type: Boolean, default: false },
  priorita: { type: Number, default: 1 },
});

module.exports = mongoose.model("Task", taskSchema);