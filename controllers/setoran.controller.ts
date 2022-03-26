import { DefineRoute } from "./controller-util";
import SetoranWajib = require("../models/SetoranWajib");
import SetoranPokok = require("../models/SetoranPokok");
import Member = require("../models/Member");
import mongo = require("mongodb");
import {
   HasRoleAdmin,
   IsLoggedIn,
   UserHasRole,
} from "../middlewares/auth";
import createHttpError = require("http-errors");
import mongoose, { Model } from "mongoose";
import { RequestHandler } from "express";

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
         filterQuery(SetoranWajib)
      ),
      DefineRoute("post", IsLoggedIn, async (req, res, next) => {
         try {
            const { tanggal, deskripsi, memberId, saldo } = req.body;
            const setoran = await SetoranWajib.create({
               tanggal,
               deskripsi,
               memberId,
               saldo,
            });
            const item = await Member.findOne({ _id: memberId });
            item.setoranId.push({ _id: setoran._id });
            await item.save();

            res.sendStatus(201);
         } catch (error) {
            console.error(error);
            res.status(500).json(error);
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
         filterQuery(SetoranPokok)
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

const { ObjectId } = mongo;
function filterQuery(schemaModel: Model<any>): RequestHandler {
   return (req, res, next) => {
      const { page = 0, size = 7, noPage = false } = req.query;
      const { member = null, bulan = null, tahun = null } = req.query;

      let dateFilter: any[] = [];
      const filter = {} as any;
      // if (typeof member === "string")
      //    filter.push({
      //       $eq: { memberId: new mongoose.Types.ObjectId(member) },
      //    });
      if (bulan) dateFilter.push({ $eq: [{ $month: "$tanggal" }, bulan] });
      if (tahun) dateFilter.push({ $eq: [{ $year: "$tanggal" }, tahun] });

      if (typeof member === "string") {
         filter.memberId = new ObjectId(member);
      }

      if (dateFilter.length > 0) {
         filter.$expr = {
            $and: dateFilter,
         };
      }

      const builder = schemaModel.find(filter);

      if (!noPage) {
         if (typeof req.query.size === "number") {
            builder.limit(+size);
         }

         if (typeof req.query.page === "number") {
            builder.skip(+page * +size);
         }
      }

      console.log(builder.toString());
      builder
         .populate({
            path: "memberId",
            select: "id nama",
         })
         .exec()
         .then(async (data) => {
            console.log(data);
            res.status(200).json({
               total: await SetoranWajib.count().exec(),
               page: Number(page),
               size: Number(size),
               data: data,
            });
         })
         .catch((err) => next(createHttpError(500, err)));
   };
}
