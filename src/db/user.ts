import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from ".";
import { tryAwait, tryCatch } from "../utils";

interface UserAttributes {
  id: number;
  wx_unionid?: string | null;
  kf_mp_openid?: string | null;
  kf_oa_openid?: string | null;
  subscribed_factor?: boolean | null;
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
    allowNull: true,
  },
  kf_mp_openid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kf_oa_openid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subscribed_factor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export const syncUser = async (
  where: RequiredPartial<UserCreationAttributes, "wx_unionid">,
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

export const isSubscribed = async (
  where: RequiredPartial<UserCreationAttributes, "wx_unionid">
) => {
  if (where.wx_unionid) {
    const [err, existedUser] = await tryAwait(
      User.findOne({
        where,
      })
    );
    if (existedUser) {
      return !!existedUser.get("subscribed_factor");
    } else if (!err) {
      return false;
    } else {
      return Promise.reject(err);
    }
  }

  return Promise.reject(new Error("wx_unionid is required"));
};
