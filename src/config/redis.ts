import dotenv from "dotenv";
dotenv.config();

import {createClient} from "redis";

const redisClient = createClient({
    socket:{
        host:process.env.REDIS_HOST,
        port:parseInt(process.env.REDIS_PORT || '6379'),
    },
});


redisClient.on('error', (err) => {
    console.error('❌ Redis Error:', err);
});

redisClient.on('connect', () => {
    console.log('🔴 Connected to Redis');
});

await redisClient.connect();

export type RedisClient = typeof redisClient;
export default redisClient;