const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usersSchema = new mongoose.Schema({
  nama: {
    type: String,
  },
  alamat: {
    type: String,
  },
  email: {
    type: String,
  },
  noPegawaiPertamina: {
    type: String,
  },
  noTlpn: {
    type: String,
  },
  password: {
    type: String,
  },
})

module.exports = mongoose.model('Users', usersSchema)