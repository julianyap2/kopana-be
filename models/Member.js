const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const MemberSchema = new mongoose.Schema({
  foto: {
    type: String,
  },
  nama: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  nomerAnggota: {
    type: String,
  },
  nomerTelepon: {
    type: String,
  },
  nomerPegawaiPertamina: {
    type: String,
  },
  noKtp: {
    type: String,
  },
  tanggalLahir: {
    type: String,
  },
  fotoKtp: {
    type: String,
  },
  user: {
    type: ObjectId,
    ref: 'Users'
  },
  setoranId: [{
    type: ObjectId,
    ref: 'SetoranWajib'
  }],
  setoranPokokId: [{
    type: ObjectId,
    ref: 'SetoranPokok'
  }]
})

module.exports = mongoose.model('Member', MemberSchema)