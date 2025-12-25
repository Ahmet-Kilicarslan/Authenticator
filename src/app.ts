import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import authenticationRoute from "./routes/AuthenticationRoute.js";
import profileRoute from "./routes/ProfileRoute.js";
import oauthRoute from "./routes/OAuthRoute.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']

}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


//--------Routes----------

app.use('/api/auth', authenticationRoute);
app.use('/api/profile', profileRoute);
app.use('/api/oauth', oauthRoute);

//------------------------

export default app;