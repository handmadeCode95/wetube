import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = process.env.PORT || 4000;
const handleListening = () =>
	console.log(`✅ Server Listening on port ${PORT}🚀\n🔗 https://itzytube.herokuapp.com`);

app.listen(PORT, handleListening);