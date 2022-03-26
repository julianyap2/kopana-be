import type { Request, Response } from "express";
import { UserRoleModel } from "../models/UserRole";
import Member = require("../models/Member");
import bcrypt = require("bcryptjs");
import createHttpError = require("http-errors");

import { DefineRoute } from "./controller-util";
import Users, { IUser } from "../models/Users";
import session = require("express-session");
import {
   HasRoleAdmin,
   IsLoggedIn,
   Unauthorized,
} from "../middlewares/auth";
import { uploadSingle } from '../middlewares/multer'

const SALT = 12;
const userController: Controller = {
   ["/whoami"]: {
      method: "get",
      async action(req, res, next) {
         const u = req.user;
         if (!u) return next(createHttpError(Unauthorized()));
         res.json(u);
      },
   },

   ["/sign-up"]: {
      method: "post",
      uploadSingle,
      async action(req: Request, res: Response, next) {
         try {
            const {
               nama,
               password,
               alamat,
               email,
               noPegawaiPertamina,
               noTlpn,
            } = req.body;

            console.log(req.body);

            const defaultRole = await UserRoleModel.findOne({
               name: "user",
            }).exec();

            console.log(defaultRole);
            const userExist = await Users.findOne({ email });

            if (!userExist) {
               const hashed = bcrypt.hashSync(password, SALT);
               const newUser = await Users.create({
                  nama: nama,
                  password: hashed,
                  alamat: alamat,
                  email: email,
                  noPegawaiPertamina: noPegawaiPertamina,
                  noTlpn: noTlpn,
                  roles: [defaultRole!._id],
               });

               const newMember = await Member.create({
                  nama: newUser.nama,
                  alamat: newUser.nama,
                  email: newUser.email,
                  nomerPegawaiPertamina: newUser.noPegawaiPertamina,
                  nomerTelepon: newUser.noTlpn,
                  user: newUser._id
               });

               return res.status(201).json(newMember);
            } else {
               res.status(400).json({ message: "User already exists..." });
            }
         } catch (error) {
            next(createHttpError(500, error));
         }
      },
   },

   ["/login"]: DefineRoute(
      "post",
      async function Login(req: Request, res: Response, next) {
         console.log("User try to login...");

         if (req.user) {
            const user = req.user;
            const member = Member.findOne({ email: user.email });
         }

         try {
            const { email, password } = req.body;
            if (!email && !password)
               return next(createHttpError(400, Error("No Input!")));

            const user = await Users.findOne({ email: email }).populate('roles');
            if (user) {
               const isPasswordMatch = await bcrypt.compare(
                  password,
                  user.password
               );

               if (isPasswordMatch) {
                  delete (user as any).password;
                  req.user = req.session.user = user as any;

                  // if (user.email === "admin@admin.com") {
                  //    return res.status(200).json(user);
                  // }

                  const member = await Member.findOne({ email: email });
                  if (member)
                     res.status(200).json({
                        message: "Login successful",
                        roles: user.roles.map(e => e.name),
                        data: {
                           nama: member.nama,
                           alamat: member.alamat,
                           email: member.email,
                           noPegawaiPertamina:
                              member.nomerPegawaiPertamina,
                           noTlpn: member.nomerTelepon,
                           id: member._id,
                           idUser: user._id,
                        },
                     });
                  else
                     res.sendStatus(200)
               } else {
                  console.log("Fail wrong password");
                  next(createHttpError(400, Error("Invalid Password")));
               }
            } else {
               console.log("Not Exist!");
               return next(createHttpError(404, Error("User not found!")));
            }
         } catch (error) {
            console.error(error);
            return next(createHttpError(500, error));
         }
      }
   ),

   ["/logout"]: DefineRoute("get", function Logout(req, res) {
      if (req.user) {
         req.session.regenerate(function (err) {
            if (err) {
               console.error(err);
               return res.sendStatus(500);
            }

            delete req.session.user;
            return res.status(200).json({
               message: "Logout succes!",
            });
         });
      }
   }),

   ["/update-password"]: DefineRoute(
      "post",
      IsLoggedIn,
      async function UpdatePassword(req: Request, res: Response, next) {
         if (!req.user) return res.sendStatus(403);

         try {
            const {
               oldPassword,
               newPassword: password,
               confirmNewPassword,
            } = req.body;
            const user = await Users.findOne({ _id: req.user._id });

            if (!user) {
               return res.status(404).json({
                  message: "Cannot find specified user id",
               });
            }

            const isPasswordMatch = await bcrypt.compare(
               oldPassword,
               user.password
            );

            if (!isPasswordMatch) {
               return res.status(400).json({
                  error: "Password lama tidak cocok",
               });
            }

            const isSamePassword = await bcrypt.compare(
               password,
               user.password
            );
            if (isSamePassword) {
               return next(
                  createHttpError(
                     400,
                     Error(
                        "Password baru tidak boleh sama dengan password lama!"
                     )
                  )
               );
            } else if (password !== confirmNewPassword) {
               res.status(400).json({
                  message: "Konfirmasi password tidak sama",
               });
            } else if (
               password === req.body.confirmNewPassword &&
               password !== isSamePassword
            ) {
               user.password = bcrypt.hashSync(password, SALT);
               await user.save();
               res.status(200).json({
                  message: "Password berhasil berubah",
               });
            }
         } catch (error) {
            next(createHttpError(500, error));
         }
      }
   ),

   ["/user/get-all"]: DefineRoute(
      "get",
      IsLoggedIn,
      HasRoleAdmin,
      async function getAllUser(req, res) {
         res.json(await Users.find().exec());
      }
   ),
};

export = userController;