import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on('hit', (key) => {
    console.log(`Cache hit for key: ${key}`);
});

redis.on("error", (err) => {
    console.error("Redis Verbindungsfehler:", err);
});