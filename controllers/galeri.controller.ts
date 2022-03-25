import { DefineRoute } from "./controller-util";
const Galeri = require("../models/Galeri");

const galeriController: Controller = {
   ["/galeri"]: [
      DefineRoute("get", async function getGaleri(req, res) {
         try {
            const galeri = await Galeri.find();
            res.status(200).json({
               data: galeri,
            });
         } catch (error) {
            res.status(500).json({ message: "Internal server error" });
         }
      }),
      DefineRoute("post", async function addGaleri(req, res) {
         Promise.all(
            req["files"].map(async (file) => {
               const newUpload = new Galeri({
                  imageUrl: `images/${file.filename}`,
               });
               await newUpload.save();
            })
         )
            .then(() => res.status(201).send("Gambar berhasil di upload"))
            .catch((e) => {
               res.status(500).json(e);
            });
      }),
   ],

   ["/galeri/:id"]: DefineRoute(
      "delete",
      async function deleteGaleri(req, res) {
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
      }
   ),
};

export = galeriController;
