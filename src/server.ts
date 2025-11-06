import dotenv from 'dotenv';
import app from "./app";

dotenv.config();

const port = parseInt(process.env.DB_PORT || '5342');

app.listen(port,() =>{



})

