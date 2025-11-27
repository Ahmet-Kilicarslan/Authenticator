import dotenv from 'dotenv';
import app from "./app.js";
import pool from "./config/dbc.js";
import redisClient from "./config/redis.js";
dotenv.config();
const port = parseInt(process.env.PORT || '3000');
async function testConnection() {
    try {
        const sql = "SELECT NOW() as current_time";
        const pgResult = await pool.query(sql);
        console.log('📊 PostgreSQL connected:', pgResult.rows[0].current_time);
        await redisClient.set('test_key', 'Hello Redis');
        const redisValue = await redisClient.get(`test_key`);
        console.log('Redis connected', redisValue);
        return true;
    }
    catch (err) {
        console.error("❌ Database connection failed:", err);
        return false;
    }
}
async function startServer() {
    const connection = await testConnection();
    if (!connection) {
        console.error('❌ Failed to connect to databases. Exiting...');
        process.exit(1);
    }
    const server = app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📊 Health check: http://localhost:${port}/health`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            console.log('✅ HTTP server closed');
            // Close database connections
            pool.end(() => {
                console.log('✅ PostgreSQL connection closed');
            });
            redisClient.quit().then(() => {
                console.log('✅ Redis connection closed');
                process.exit(0);
            });
        });
    });
}
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map