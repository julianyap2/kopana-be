import { Schema, model, Model } from "mongoose";
import { UserRoleModel } from "./UserRole";

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
   roles: [{ type: Types.ObjectId, ref: UserRoleModel }],
   createDate: {
      type: Types.Date,
      default: Date.now,
   },
});

const UserModel = model("Users", UserSchema) as UserModel;
//@ts-ignore
UserModel.Schema = UserSchema;
export = UserModel;

interface UserModel extends Model<IUser> {
   readonly Schema: typeof UserSchema;
}

interface IUser {
   nama: string;
   email: string;
   password: string;
   noPegawaiPertamina: string;
   createDate: Date;
   roles: Array<Schema.Types.ObjectId>;

   noTlpn?: string;
   //  roles
   alamat?: string;
}
