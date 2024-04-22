const { Sequelize, DataTypes } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

const sequelize = new Sequelize(
  "kungfu_cloud_database",
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  {
    host,
    port,
    dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
  }
);

// 定义数据模型
const Counter = sequelize.define("Counter", {
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

const User = sequelize.define("User", {
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
    allowNull: false,
    defaultValue: false,
  },
});

// 数据库初始化方法
async function init() {
  await Counter.sync({ alter: true });
  await User.sync({ alter: true });
}

// 导出初始化方法和模型
module.exports = {
  init,
  User,
  Counter,
};
