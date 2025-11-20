import express from "express";
import dotenv from "dotenv";
import authenticationRoute from "../src/routes/AuthenticationRoute.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//--------Routes----------
app.use('Authentication', authenticationRoute);
//------------------------
export default app;
//# sourceMappingURL=app.js.map