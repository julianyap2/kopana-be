import { Schema, model, Model } from "mongoose";
import { IUserRole } from "./UserRole";

const { Types } = Schema;
const UserSchema = new Schema<IUser>({
   nama: {
      type: String,
      required: true,
   },
   alamat: String,
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   noPegawaiPertamina: {
      type: String,
      required: true,
      unique: true,
   },
   noTlpn: String,
   roles: [{ type: Types.ObjectId, ref: "UserRole" }],
   createDate: {
      type: Types.Date,
      default: Date.now,
   },
});

const UserModel = model("Users", UserSchema) as UserModel;
//@ts-ignore
UserModel.Schema = UserSchema;

export default UserModel;
export interface UserModel extends Model<IUser> {
   readonly Schema: typeof UserSchema;
}

export interface IUser {
   nama: string;
   email: string;
   password: string;
   noPegawaiPertamina: string;
   createDate: Date;
   roles: Array<IUserRole>;

   noTlpn?: string;
   //  roles
   alamat?: string;
}
