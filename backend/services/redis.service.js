import Redis from "ioredis";
console.log("REDIS_HOST:", process.env.REDIS_HOST);
console.log("REDIS_PORT:", process.env.REDIS_PORT);
console.log("REDIS_PASSWORD:", process.env.REDIS_PASSWORD ? "✔️ Loaded" : "❌ Not loaded");

const redisClient = new Redis({
    host : process.env.REDIS_HOST,
    port : process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () =>{
    console.log('Redis Connected');
})

redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });

export default redisClient;