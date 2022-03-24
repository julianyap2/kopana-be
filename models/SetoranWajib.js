const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const setoranWajibSchema = new mongoose.Schema({
  tanggal: {
    type: Date,
    required: true
  },
  deskripsi: {
    type: String,
  },
  memberId: {
    type: ObjectId,
    ref: 'Member',
    required: true
  },
  saldo: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("SetoranWajib", setoranWajibSchema);
