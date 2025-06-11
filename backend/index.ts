import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import express from "express";

import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();

app.use(cookieParser()); // for parsing cookies
app.use(express.json()); // for parsing application/json

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
});

function cookieParser(): any {
    throw new Error("Function not implemented.");
}
