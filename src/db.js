import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

//sudo service mongod start
db.on("error", (error) => console.log("❌ DB Error\n", error));
db.once("open", () => console.log("✅ Connected to DB"));