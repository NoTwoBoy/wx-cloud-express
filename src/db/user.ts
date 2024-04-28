import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from ".";
import { tryAwait, tryCatch } from "../utils";

interface UserAttributes {
  id: number;
  wx_unionid?: string;
  kf_mp_openid?: string;
  kf_oa_openid?: string;
  subscribed_factor?: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export const User = sequelize.define<UserInstance>("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  wx_unionid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kf_mp_openid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kf_oa_openid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subscribed_factor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// 使传入的interface中某个key为必选的泛型

export const syncUser = async (
  where: MakeRequired<UserCreationAttributes, "wx_unionid">,
  update?: UserCreationAttributes
) => {
  if (where.wx_unionid) {
    const [err, existedUser] = await tryAwait(
      User.findOne({
        where,
      })
    );
    if (existedUser) {
      return existedUser.update({
        ...update,
      });
    } else if (!err) {
      return User.create({
        ...where,
        ...update,
      });
    } else {
      return Promise.reject(err);
    }
  }

  return Promise.reject(new Error("wx_unionid is required"));
};
