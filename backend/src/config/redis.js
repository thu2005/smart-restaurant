const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Event handlers
redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});

redis.on('ready', () => {
    console.log('🚀 Redis is ready to use');
});

// Cache helper functions
const cache = {
    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any>} - Parsed value or null
     */
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    },

    /**
     * Set value in cache with optional TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
     * @returns {Promise<boolean>} - Success status
     */
    async set(key, value, ttl = 3600) {
        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await redis.setex(key, ttl, serialized);
            } else {
                await redis.set(key, serialized);
            }
            return true;
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    },

    /**
     * Delete one or more keys from cache
     * @param {string|string[]} keys - Key(s) to delete
     * @returns {Promise<number>} - Number of keys deleted
     */
    async del(keys) {
        try {
            const keysArray = Array.isArray(keys) ? keys : [keys];
            return await redis.del(...keysArray);
        } catch (error) {
            console.error(`Cache delete error:`, error);
            return 0;
        }
    },

    /**
     * Delete all keys matching a pattern
     * @param {string} pattern - Pattern to match (e.g., 'menu:*')
     * @returns {Promise<number>} - Number of keys deleted
     */
    async delPattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                return await redis.del(...keys);
            }
            return 0;
        } catch (error) {
            console.error(`Cache delete pattern error:`, error);
            return 0;
        }
    },

    /**
     * Check if key exists
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} - Existence status
     */
    async exists(key) {
        try {
            return (await redis.exists(key)) === 1;
        } catch (error) {
            console.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    },

    /**
     * Set expiration time for a key
     * @param {string} key - Cache key
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>} - Success status
     */
    async expire(key, ttl) {
        try {
            return (await redis.expire(key, ttl)) === 1;
        } catch (error) {
            console.error(`Cache expire error for key ${key}:`, error);
            return false;
        }
    },

    /**
     * Flush all cache
     * @returns {Promise<boolean>} - Success status
     */
    async flushAll() {
        try {
            await redis.flushall();
            return true;
        } catch (error) {
            console.error('Cache flush error:', error);
            return false;
        }
    },

    /**
     * Get Redis client for advanced operations
     * @returns {Redis} - Redis client instance
     */
    getClient() {
        return redis;
    }
};

// Cache key generators
const cacheKeys = {
    // Menu caching keys
    menuItems: (restaurantId, filters = {}) => {
        const filterStr = Object.keys(filters).length > 0 
            ? `:${JSON.stringify(filters)}` 
            : '';
        return `menu:items:${restaurantId}${filterStr}`;
    },
    menuItem: (restaurantId, itemId) => `menu:item:${restaurantId}:${itemId}`,
    menuCategories: (restaurantId) => `menu:categories:${restaurantId}`,
    menuCategory: (categoryId) => `menu:category:${categoryId}`,
    
    // Session keys
    session: (sessionId) => `session:${sessionId}`,
    userSessions: (userId) => `user:sessions:${userId}`,
    
    // Restaurant data
    restaurant: (restaurantId) => `restaurant:${restaurantId}`,
    
    // Reviews
    reviews: (menuItemId) => `reviews:${menuItemId}`,
};

module.exports = { redis, cache, cacheKeys };
