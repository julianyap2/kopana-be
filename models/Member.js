const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const memberSchema = new mongoose.Schema({
  foto: {
    type: String,
  },
  nama: {
    type: String,
  },
  email: {
    type: String,
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
  setoranId: [{
    type: ObjectId,
    ref: 'SetoranWajib'
  }],

  setoranPokokId: [{
    type: ObjectId,
    ref: 'SetoranPokok'
  }]
})

module.exports = mongoose.model('Member', memberSchema)