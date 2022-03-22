const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const saranSchema = new mongoose.Schema({
  saran: {
    type: String,
  }
});

module.exports = mongoose.model("Saran", saranSchema);
