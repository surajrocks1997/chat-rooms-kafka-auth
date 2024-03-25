const express = require("express");

const app = express();

app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API IS RUNNING!!"));
app.use("/api/auth", require("./routes/api/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Started on Port ${PORT}`));
