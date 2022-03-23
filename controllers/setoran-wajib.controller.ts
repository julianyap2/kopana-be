import { DefineRoute } from "./controller-util";
import SetoranWajib from "../models/SetoranWajib";
import SetoranPokok from "../models/SetoranPokok";
import Member from "../models/Member";
import {
   HasRoleAdmin,
   IsLoggedIn,
   UserHasRole,
} from "../middlewares/auth";
import createHttpError from "http-errors";

const setoranController = {
   ["/setoran-wajib"]: [
      DefineRoute(
         "get",
         IsLoggedIn,
         async (req, res, next) => {
            if (UserHasRole(req.user!, "admin")) return next();
            SetoranWajib.find()
               .where("memberId")
               .where("user")
               .where("_id")
               .equals(req.user!._id)
               .populate({
                  path: "memberId",
                  select: "id nama",
               })
               .exec()
               .then((data) => res.status(200).json(data))
               .catch((err) => next(createHttpError(500, err)));
         },
         HasRoleAdmin,
         async (req, res, next) => {
            SetoranWajib.find()
               .populate({
                  path: "memberId",
                  select: "id nama",
               })
               .exec()
               .then((data) => res.status(200).json(data))
               .catch((err) => next(createHttpError(500, err)));
         }
      ),
      DefineRoute("post", IsLoggedIn, async (req, res) => {
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
      }),
      DefineRoute("put", IsLoggedIn, async (req, res) => {
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
      }),
   ],

   ["/setoran-pokok"]: [
      DefineRoute(
         "get",
         IsLoggedIn,
         async (req, res, next) => {
            if (UserHasRole(req.user!, "admin")) return next();
            SetoranPokok.find()
               .where("memberId")
               .where("user")
               .where("_id")
               .equals(req.user!._id)
               .populate({
                  path: "memberId",
                  select: "id nama",
               })
               .exec()
               .then((data) => res.status(200).json(data))
               .catch((err) => next(createHttpError(500, err)));
         },
         HasRoleAdmin,
         async (req, res, next) => {
            SetoranPokok.find()
               .populate({
                  path: "memberId",
                  select: "id nama",
               })
               .exec()
               .then((data) => res.status(200).json(data))
               .catch((err) => next(createHttpError(500, err)));
         }
      ),
      DefineRoute("post", IsLoggedIn, async (req, res) => {
         try {
            const { tanggal, deskripsi, memberId } = req.body;
            let setoran = await SetoranPokok.create({
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
      }),
      DefineRoute("put", IsLoggedIn, async (req, res) => {
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
      }),
   ],
} as Controller;

export = setoranController;
