const mongoose = require("mongoose");

const galeriSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
  }
})

module.exports = mongoose.model('Galeri', galeriSchema)