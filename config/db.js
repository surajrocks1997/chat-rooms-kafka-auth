const Sequalize = require("sequelize");
const seqaulize = new Sequalize("chat_room_kafka", "root", "admin", {
    host: "127.0.0.1",
    port: "3306",
    dialect: "mysql",
});

const connectDB = async () => {
    try {
        await seqaulize.authenticate();
        console.log("Connection to MYSQL Successful");
    } catch (err) {
        console.error("Unable to connect to database", err);
    }
};

module.exports = { connectDB, seqaulize };
