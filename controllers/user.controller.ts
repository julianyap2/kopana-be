import { Request, Response } from "express";
import { UserRoleModel } from "../models/UserRole";
import Member = require("../models/Member");
import bcrypt = require("bcryptjs");
import Users = require("../models/Users");
import { DefineRoute } from "./controller-util";

console.log(Member);

const userController: Controller = {
   ["/whoami"]: {
      method: "get",
      async action(req, res) {
         const user = await Users.findById(req.query.userId).exec();
         if (user) return res.status(200).json(user);
         res.status(404).json({
            message: "User not found",
         });
      },
   },

   ["/sign-up"]: {
      method: "post",
      async action(req: Request, res: Response) {
         try {
            const {
               nama,
               password,
               alamat,
               email,
               noPegawaiPertamina,
               noTlpn,
            } = req.body;

            const defaultRole = await UserRoleModel.findOne({
               name: "user",
            }).exec();
            const userExist = await Users.findOne({ email });

            if (!userExist) {
               const hashed = bcrypt.hashSync(password, 12);
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
               });

               return res.status(201).json(newMember);
            } else {
               res.status(400).json({ message: "User already exists..." });
            }
         } catch (error) {
            res.status(500).json({ message: "Internal server error" });
         }
      },
   },

   ["/login"]: DefineRoute(
      "post",
      async function Login(req: Request, res: Response) {
         console.log("User try to login...");
         try {
            const { email, password } = req.body;
            const user = await Users.findOne({ email: email });
            const member = await Member.findOne({ email: email });
            if (user) {
               const isPasswordMatch = await bcrypt.compare(
                  password,
                  user.password
               );
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
                  console.log("Fail wrong password");
                  res.status(400).json({ error: "Invalid Password" });
               }
            } else {
               console.log("Not Exist!");
               res.status(401).json({ error: "User does not exist" });
            }
         } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
         }
      }
   ),

   ["/logout"]: DefineRoute("get", function Logout(req, res) {
      req.session.cookie;
      req.session.destroy(function (err) {
         if (err) {
            console.error(err);
            return res.sendStatus(500);
         }

         res.status(200).json({
            message: "Logout succes!",
         });
      });
   }),

   ["/update-password"]: DefineRoute(
      "post",
      async function UpdatePassword(req: Request, res: Response) {
         try {
            const { oldPassword, newPassword: password } = req.body;
            const user = await Users.findOne({ _id: req.session.id });

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
               res.status(400).json({
                  error: "Password baru tida boleh sama dengan password lama",
               });
            } else if (
               req.body.newPassword !== req.body.confirmNewPassword
            ) {
               res.status(400).json({
                  message: "Konfirmasi password tidak sama",
               });
            } else if (
               req.body.newPassword === req.body.confirmNewPassword &&
               req.body.newPassword !== isSamePassword
            ) {
               user.password = password;
               await user.save();
               res.status(200).json({
                  message: "Password berhasil berubah",
               });
            }
         } catch (error) {
            res.status(500).json({ message: "Internal server error" });
         }
      }
   ),

   ["/user/get-all"]: DefineRoute("get", function getAllUser(req, res) {
      res.sendStatus(500);
   }),
};

export = userController;
