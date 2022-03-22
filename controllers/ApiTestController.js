const Users = require("../models/Users");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcryptjs");
const Galeri = require("../models/Galeri");
const SetoranWajib = require("../models/SetoranWajib");
const FormDaftar = require("../models/FormDaftar");
const Member = require("../models/Member");
const SetoranPokok = require("../models/SetoranPokok");
const Saran = require("../models/Saran");
const { readFileSync } = require("fs");
const { join } = require("path");

module.exports = {
  //crud sign
  actionSignUp: async (req, res) => {
    try {
      const { nama, password, alamat, email, noPegawaiPertamina, noTlpn } =
        req.body;
      var newUser = new Users({
        nama: nama,
        password: password,
        alamat: alamat,
        email: email,
        noPegawaiPertamina: noPegawaiPertamina,
        noTlpn: noTlpn,
      });
      await Users.findOne({ email: newUser.email })
        .then(async (profile) => {
          if (!profile) {
            bcrypt.hash(newUser.password, 10, async (err, hash) => {
              if (err) {
                console.log("Error is", err.message);
              } else {
                newUser.password = hash;
                let test = await Member.create({
                  nama: newUser.nama,
                  alamat: newUser.nama,
                  email: newUser.email,
                  nomerPegawaiPertamina: newUser.noPegawaiPertamina,
                  nomerTelepon: newUser.noTlpn,
                });
                await newUser
                  .save()
                  .then(() => {
                    res.status(200).send(test);
                  })
                  .catch((err) => {
                    res.status(500).json({ message: err });
                  });
              }
            });
          } else {
            res.status(500).json({ message: "User already exists..." });
          }
        })
        .catch((err) => {
          res.status(500).json({ message: err });
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  actionSignin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email: email });
      const member = await Member.findOne({ email: email });
      if (user) {
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
          res.status(200).json({
            message: "Login successful",
            data: {
              nama: member.nama,
              alamat: member.alamat,
              email: member.email,
              noPegawaiPertamina: member.nomerPegawaiPertamina,
              noTlpn: member.nomerTelepon,
              id: member._id,
              idUser: user._id,
            },
          });
        } else {
          res.status(400).json({ error: "Invalid Password" });
        }
      } else {
        res.status(401).json({ error: "User does not exist" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword: password } = req.body;
      const user = await Users.findOne({ _id: id });

      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordMatch) {
        return res.status(400).json({
          error: "Password lama tidak cocok",
        });
      }

      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        res.status(400).json({
          error: "Password baru tida boleh sama dengan password lama",
        });
      } else if (req.body.newPassword !== req.body.confirmNewPassword) {
        res.status(400).json({ message: "Confirmasi password tidak sama" });
      } else if (
        req.body.newPassword === req.body.confirmNewPassword &&
        req.body.newPassword !== isSamePassword
      ) {
        user.password = password;
        await user.save();
        res.status(200).json({ message: "Password berhasil berubah" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  //Galeri
  addGaleri: async (req, res) => {
    Promise.all(
      req.files.map(async (file) => {
        const newUpload = new Galeri({
          imageUrl: `images/${file.filename}`,
        });
        await newUpload.save();
      })
    )
      .then(res.status(201).json("Gambar berhasil di upload"))
      .catch((e) => {
        res
          .status(500)
          .json({ message: "Something went wrong in /uploads/img", error: e });
      });
  },

  ViewGaleri: async (req, res) => {
    try {
      const galeri = await Galeri.find();
      res.status(200).json({
        data: galeri,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteGaleri: async (req, res) => {
    try {
      const { id } = req.params;
      const galeri = await Galeri.findOne({ _id: id });
      // await fs.unlink(path.join(`public/${member.fotoKtp}`));
      // await fs.unlink(path.join(`public/${member.foto}`));
      await galeri.remove();
      res.status(200).json({
        message: "Data Berhasil Terhapus",
      });
    } catch (error) {
      res.status(500).json({ message: "internal error", error });
    }
  },

  //Setoran Wajib
  addSetoranWajib: async (req, res) => {
    try {
      const { tanggal, deskripsi, memberId } = req.body;
      let setoran = await SetoranWajib.create({
        tanggal: tanggal,
        deskripsi: deskripsi,
        memberId: memberId,
      });
      const item = await Member.findOne({ _id: memberId });
      item.setoranId.push({ _id: setoran._id });
      await item.save();
      res.status(200).json({
        message: "Data Berhasil Ditambah",
      });
    } catch (error) {
      res.send(error.message);
      // res.status(500).json({ message: "Internal server error" });
    }
  },

  ViewSetoranWajib: async (req, res) => {
    try {
      const setoranWajib = await SetoranWajib.find().populate({
        path: "memberId",
        select: "id nama",
      });
      res.status(200).json({
        setoranWajib,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  ViewSetoranWajibByUser: async (req, res) => {
    try {
      const { id } = req.params;
      const setoranWajib = await SetoranWajib.findOne({
        memberId: id,
      }).populate({ path: "memberId", select: "id nama" });
      res.status(200).json({
        setoranWajib,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateOneSetoranWajib: async (req, res) => {
    try {
      const { id, tanggal, deskripsi } = req.body;
      const updateOne = await SetoranWajib.findOne({ _id: id });
      updateOne.tanggal = tanggal;
      updateOne.deskripsi = deskripsi;
      await updateOne.save();
      res.status(200).json({
        message: "Data Berhasil Terupdate",
        updateOne,
      });
    } catch (error) {
      res.status(500).json({ message: "internal error", error });
    }
  },

  //Setoran Pokok
  addSetoranPokok: async (req, res) => {
    try {
      const { tanggal, deskripsi, memberId } = req.body;
      let setoran = await SetoranPokok.create({
        tanggal: tanggal,
        deskripsi: deskripsi,
        memberId: memberId,
      });
      const item = await Member.findOne({ _id: memberId });
      item.setoranPokokId.push({ _id: setoran._id });
      await item.save();
      res.status(200).json({
        message: "Data Berhasil Ditambah",
      });
    } catch (error) {
      res.send(error.message);
      // res.status(500).json({ message: "Internal server error" });
    }
  },

  ViewSetoranPokok: async (req, res) => {
    try {
      const setoranWajib = await SetoranPokok.find().populate({
        path: "memberId",
        select: "id nama",
      });
      res.status(200).json({
        setoranWajib,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  ViewSetoranPokokByUser: async (req, res) => {
    try {
      const { id } = req.params;
      const setoranPokok = await SetoranPokok.findOne({
        memberId: id,
      }).populate({ path: "memberId", select: "id nama" });
      res.status(200).json({
        setoranPokok,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateOneSetoranPokok: async (req, res) => {
    try {
      const { id, tanggal, deskripsi } = req.body;
      const updateOne = await SetoranPokok.findOne({ _id: id });
      updateOne.tanggal = tanggal;
      updateOne.deskripsi = deskripsi;
      await updateOne.save();
      res.status(200).json({
        message: "Data Berhasil Terupdate",
        updateOne,
      });
    } catch (error) {
      res.status(500).json({ message: "internal error", error });
    }
  },

  deleteSetoraPokok: async (req, res) => {
    try {
      const { id } = req.params;
      const setoranWajib = await SetoranPokok.findOne({ _id: id });
      // await fs.unlink(path.join(`public/${member.fotoKtp}`));
      // await fs.unlink(path.join(`public/${member.foto}`));
      await setoranWajib.remove();
      res.status(200).json({
        message: "Data Berhasil Terhapus",
      });
    } catch (error) {
      res.status(500).json({ message: "internal error", error });
    }
  },

  //formDaftar
  AddformDaftar: async (req, res) => {
    try {
      const { nama, alamatRumah, alamatPangkalan } = req.body;
      const newItem = {
        nama,
        alamatRumah,
        alamatPangkalan,
        imageKtp: `image/${req.files.imageKtp[0].filename}`,
        imageKeteranganUsaha: `image/${req.files.imageKeteranganUsaha[0].filename}`,
        imageSuratTeraTimbangan: `image/${req.files.imageSuratTeraTimbangan[0].filename}`,
        imageKelengkapanSarana: `image/${req.files.imageKelengkapanSarana[0].filename}`,
      };
      const daftar = await FormDaftar.create(newItem);
      res.status(200).json({
        message: "Formulir Berhasil Ditambah",
        daftar,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  ViewFormDaftar: async (req, res) => {
    try {
      const formdaftar = await FormDaftar.find();
      res.status(200).json({
        data: formdaftar,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateOneFormDaftar: async (req, res) => {
    try {
      const { id, nama, alamatRumah, alamatPangkalan } = req.body;
      const updateOne = await FormDaftar.findOne({ _id: id });
      if (req.file == undefined) {
        updateOne.nama = nama;
        updateOne.alamatRumah = alamatRumah;
        updateOne.alamatPangkalan = alamatPangkalan;
        await updateOne.save();
        res.status(200).json({
          message: "Data Berhasil Terupdate",
          updateOne,
        });
      } else {
        await fs.unlink(path.join(`public/${updateOne.imageKtp}`));
        await fs.unlink(path.join(`public/${updateOne.imageKeteranganUsaha}`));
        await fs.unlink(
          path.join(`public/${updateOne.imageSuratTeraTimbangan}`)
        );
        await fs.unlink(
          path.join(`public/${updateOne.imageKelengkapanSarana}`)
        );
        updateOne.nama = nama;
        updateOne.alamatRumah = alamatRumah;
        updateOne.alamatPangkalan = alamatPangkalan;
        (updateOne.imageKtp = `image/${req.files.imageKtp[0].filename}`),
          (updateOne.imageKeteranganUsaha = `image/${req.files.imageKeteranganUsaha[0].filename}`),
          (updateOne.imageSuratTeraTimbangan = `image/${req.files.imageSuratTeraTimbangan[0].filename}`),
          (updateOne.imageKelengkapanSarana = `image/${req.files.imageKelengkapanSarana[0].filename}`),
          await updateOne.save();
        res.status(200).json({
          message: "Data Berhasil Terupdate",
          update,
        });
      }
    } catch (error) {
      res.status(500).json({ message: "internal error", error });
    }
  },

  deleteFormDaftar: async (req, res) => {
    try {
      const { id } = req.params;
      const formDaftar = await FormDaftar.findOne({ _id: id });
      // await fs.unlink(path.join(`public/${member.fotoKtp}`));
      // await fs.unlink(path.join(`public/${member.foto}`));
      await formDaftar.remove();
      res.status(200).json({
        message: "Data Berhasil Terhapus",
      });
    } catch (error) {
      res.status(500).json({ message: "internal error", error });
    }
  },

  //profile
  ViewDataProfile: async (req, res) => {
    try {
      const member = await Member.find().populate({
        path: "setoranId",
        select: "id tanggal deskripsi",
      });
      res.status(200).json({
        data: member,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  ViewDataProfileById: async (req, res) => {
    try {
      const member = await Member.findOne({ _id: req.params.id })
        .populate({ path: "setoranId", select: "id tanggal deskripsi" })
        .populate({ path: "setoranPokokId", select: "id tanggal deskripsi" });

      const { foto } = member;
      // try {
      //   const fileFoto = readFileSync(join(process.cwd(), foto));
      //   member.foto = fileFoto.toString("base64");
      // } catch (err) {
      //   console.error(err);
      //   member.foto = null;
      // }
      if (member.foto) {
        member.foto = member.foto.replace(/\\/g, "/");
        member.foto = member.foto.replace("public", "");
      }
      // console.log(member.foto);
      res.status(200).json(member);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateDataProfile: async (req, res) => {
    try {
      const {
        nama,
        email,
        nomerAnggota,
        nomerTelepon,
        noPegawaiPertamina,
        noKtp,
        tanggalLahir,
      } = req.body;
      const newItem = {
        nama,
        email,
        nomerAnggota,
        nomerTelepon,
        noPegawaiPertamina,
        noKtp,
        tanggalLahir,
        fotoKtp: `image/${req.files.imageKtp[0].filename}`,
        foto: `image/${req.files.fotoProfile[0].filename}`,
      };
      const update = await Member.create(newItem);
      res.status(200).json({
        message: "Data Berhasil Terupdate",
        update,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  updateOneDataProfile: async (req, res) => {
    try {
      const {
        id,
        nama,
        email,
        nomerAnggota,
        nomerTelepon,
        nomerPegawaiPertamina,
        noKtp,
        tanggalLahir,
      } = req.body;
      const updateOne = await Member.findOne({ _id: id });
      if (req.files === undefined) {
        console.log("masuk sini");
        updateOne.nama = nama;
        updateOne.email = email;
        updateOne.nomerAnggota = nomerAnggota;
        updateOne.nomerTelepon = nomerTelepon;
        updateOne.nomerPegawaiPertamina = nomerPegawaiPertamina;
        updateOne.noKtp = noKtp;
        updateOne.tanggalLahir = tanggalLahir;
        await updateOne.save();
        res.status(200).json({
          message: "Data Berhasil Terupdate",
          updateOne,
        });
      } else {
        console.log("masuk sini cuy");
        // await fs.unlink(path.join(`public/${updateOne.fotoKtp}`));
        // await fs.unlink(path.join(`public/${updateOne.foto}`));
        updateOne.nama = nama;
        updateOne.email = email;
        updateOne.nomerAnggota = nomerAnggota;
        updateOne.nomerTelepon = nomerTelepon;
        updateOne.nomerPegawaiPertamina = nomerPegawaiPertamina;
        updateOne.noKtp = noKtp;
        updateOne.tanggalLahir = tanggalLahir;
        if (req.files.imageKtp && req.files.imageKtp.length > 0) {
          updateOne.fotoKtp = `image/${req.files.imageKtp[0].filename}`;
        }
        if (req.files.fotoProfile && req.files.fotoProfile.length > 0) {
          const [item1] = req.files.fotoProfile;
          console.log(item1);
          updateOne.foto = item1.path;
        }
        await updateOne.save();
        res.status(200).json({
          message: "Data Berhasil Terupdate",
          updateOne,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "internal error", error });
    }
  },

  deleteDataProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const member = await Member.findOne({ _id: id });
      // await fs.unlink(path.join(`public/${member.fotoKtp}`));
      // await fs.unlink(path.join(`public/${member.foto}`));
      await member.remove();
      res.status(200).json({
        message: "Data Berhasil Terhapus",
      });
    } catch (error) {
      res.status(500).json({ message: "internal error", error });
    }
  },

  //saran
  addSaran: async (req, res) => {
    try {
      const { saran } = req.body;
      let addsaran = await Saran.create({
        saran: saran,
      });
      res.status(200).json({
        message: "Data Berhasil Ditambah",
        data: addsaran,
      });
    } catch (error) {
      res.send(error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteSaran: async (req, res) => {
    try {
      const { id } = req.params;
      let addsaran = await Saran.findOne({
        _id: id,
      });
      await addsaran.remove();
      res.status(200).json({
        message: "Data Berhasil DiHapus",
      });
    } catch (error) {
      res.send(error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
