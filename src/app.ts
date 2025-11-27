import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import authenticationRoute from "./routes/AuthenticationRoute.js";

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


//--------Routes----------

app.use('/api/auth', authenticationRoute);

//------------------------

export default app;