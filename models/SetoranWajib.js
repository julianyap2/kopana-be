const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const setoranWajibSchema = new mongoose.Schema({
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

module.exports = mongoose.model("SetoranWajib", setoranWajibSchema);
