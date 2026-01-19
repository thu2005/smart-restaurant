const { cache, cacheKeys } = require('../config/redis');

/**
 * Cache middleware for menu endpoints
 * Caches GET requests and invalidates on POST/PUT/PATCH/DELETE
 */
const cacheMiddleware = (options = {}) => {
    const {
        ttl = 3600, // Default 1 hour
        keyGenerator = null, // Custom key generator function
        skipCache = false, // Skip cache for this request
    } = options;

    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET' || skipCache) {
            return next();
        }

        try {
            // Generate cache key
            let cacheKey;
            if (keyGenerator) {
                cacheKey = keyGenerator(req);
            } else {
                // Default key: method:path:query
                const queryStr = Object.keys(req.query).length > 0 
                    ? `:${JSON.stringify(req.query)}` 
                    : '';
                cacheKey = `${req.method}:${req.path}${queryStr}`;
            }

            // Try to get from cache
            const cachedData = await cache.get(cacheKey);
            
            if (cachedData) {
                console.log(`✅ Cache HIT: ${cacheKey}`);
                return res.status(200).json(cachedData);
            }

            console.log(`❌ Cache MISS: ${cacheKey}`);

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache the response
            res.json = function(data) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache.set(cacheKey, data, ttl).catch(err => {
                        console.error('Cache set error:', err);
                    });
                }
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next(); // Continue without cache on error
        }
    };
};

/**
 * Menu-specific cache middleware
 */
const menuCacheMiddleware = cacheMiddleware({
    ttl: 1800, // 30 minutes for menu data
    keyGenerator: (req) => {
        const { restaurantId, itemId } = req.params;
        const filters = req.query;
        
        if (itemId) {
            return cacheKeys.menuItem(restaurantId, itemId);
        }
        
        return cacheKeys.menuItems(restaurantId, filters);
    }
});

/**
 * Category cache middleware
 */
const categoryCacheMiddleware = cacheMiddleware({
    ttl: 3600, // 1 hour for categories (less frequent changes)
    keyGenerator: (req) => {
        const { restaurantId, categoryId } = req.params;
        
        if (categoryId) {
            return cacheKeys.menuCategory(categoryId);
        }
        
        return cacheKeys.menuCategories(restaurantId);
    }
});

/**
 * Review cache middleware
 */
const reviewCacheMiddleware = cacheMiddleware({
    ttl: 600, // 10 minutes for reviews (more dynamic)
    keyGenerator: (req) => {
        const { menuItemId } = req.params;
        return cacheKeys.reviews(menuItemId);
    }
});

/**
 * Cache invalidation middleware
 * Clears cache when data is modified
 */
const invalidateCacheMiddleware = (patterns) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to invalidate cache after successful response
        res.json = function(data) {
            // Only invalidate on successful modifications
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const patternsToInvalidate = typeof patterns === 'function' 
                    ? patterns(req) 
                    : patterns;

                Promise.all(
                    patternsToInvalidate.map(pattern => cache.delPattern(pattern))
                ).then(() => {
                    console.log(`🗑️  Cache invalidated: ${patternsToInvalidate.join(', ')}`);
                }).catch(err => {
                    console.error('Cache invalidation error:', err);
                });
            }
            return originalJson(data);
        };

        next();
    };
};

/**
 * Menu invalidation middleware
 */
const invalidateMenuCache = invalidateCacheMiddleware((req) => {
    const { restaurantId } = req.params || req.body;
    return [
        `menu:items:${restaurantId}*`,
        `menu:item:${restaurantId}*`,
        `menu:categories:${restaurantId}*`,
    ];
});

/**
 * Review invalidation middleware
 */
const invalidateReviewCache = invalidateCacheMiddleware((req) => {
    const { menuItemId } = req.params || req.body;
    return [`reviews:${menuItemId}*`];
});

module.exports = {
    cacheMiddleware,
    menuCacheMiddleware,
    categoryCacheMiddleware,
    reviewCacheMiddleware,
    invalidateCacheMiddleware,
    invalidateMenuCache,
    invalidateReviewCache,
};
