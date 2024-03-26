const { DataTypes } = require("sequelize");
const { seqaulize } = require("../config/db");

const User = seqaulize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        autoIncrementInitialValue: 1000,
        primaryKey: true,
      },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

User.sync();

module.exports = { User };
