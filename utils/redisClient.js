const redis = require('redis')
const redisClient = redis.createClient(6379)

const connectToRedis = async () => {
    if (redisClient.status !== 'ready') {
      await new Promise((resolve, reject) => {
        redisClient.on('connect', resolve);
        redisClient.on('error', reject);
      });
    }
};



module.exports = redisClient