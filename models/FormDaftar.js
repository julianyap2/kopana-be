const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const formDaftarSchema = new mongoose.Schema({
  nama: {
    type: String,
  },
  alamatRumah: {
    type: String,
  },
  alamatPangkalan: {
    type: String,
  },
  imageKtp: {
    type: String,
  },
  imageKeteranganUsaha: {
    type: String,
  },
  imageSuratTeraTimbangan: {
    type: String,
  },
  imageKelengkapanSarana: {
    type: String,
  },
});

module.exports = mongoose.model("FormDaftar", formDaftarSchema);
