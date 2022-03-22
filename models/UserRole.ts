import { Schema, model } from "mongoose";

const { Types } = Schema;

export const UserRoleSchema = new Schema<IUserRole>(
   {
      name: {
         type: Schema.Types.String,
         required: true,
         unique: true,
      },
      createDate: {
         type: Types.Date,
         default: Date.now,
      },
   },
   {
      _id: true,
   }
);

export const UserRoleModel = model("user_role", UserRoleSchema);

export interface IUserRole {
   name: string;
   createDate: Date;
}
