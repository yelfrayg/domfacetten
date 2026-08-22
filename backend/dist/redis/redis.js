"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
exports.redis.on("connect", () => {
    console.log("Connected to Redis");
});
exports.redis.on('hit', (key) => {
    console.log(`Cache hit for key: ${key}`);
});
exports.redis.on("error", (err) => {
    console.error("Redis Verbindungsfehler:", err);
});
