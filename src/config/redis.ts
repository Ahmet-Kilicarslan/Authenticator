import dotenv from "dotenv";
dotenv.config();

import {createClient} from "redis";

const redisClient = createClient({
    socket:{
        host:process.env.REDIS_HOST,
        port:parseInt(process.env.REDIS_PORT || '6379'),
    },
});

await redisClient.connect();

export default redisClient;