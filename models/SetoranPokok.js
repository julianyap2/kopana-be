const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const setoranPokokSchema = new mongoose.Schema({
  tanggal: {
    type: Date,
  },
  deskripsi: {
    type: String,
  },
  memberId:{
    type: ObjectId,
    ref: 'Member'
  }
});

module.exports = mongoose.model("SetoranPokok", setoranPokokSchema);
