const express = require("express");
const { check } = require("express-validator");
const menuController = require("../controllers/menu.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { 
    menuCacheMiddleware, 
    categoryCacheMiddleware,
    invalidateMenuCache 
} = require("../middlewares/cache.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management endpoints
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         restaurantId:
 *           type: string
 *           format: uuid
 *         displayOrder:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         menuItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MenuItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         categoryId:
 *           type: string
 *           format: uuid
 *         restaurantId:
 *           type: string
 *           format: uuid
 *         image:
 *           type: string
 *         prepTime:
 *           type: integer
 *           description: Preparation time in minutes
 *         isPopular:
 *           type: boolean
 *         dietary:
 *           type: array
 *           items:
 *             type: string
 *         isAvailable:
 *           type: boolean
 *         stockStatus:
 *           type: string
 *           enum: [in_stock, low_stock, out_of_stock]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ModifierOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         priceAdjustment:
 *           type: number
 *         modifierGroupId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ModifierGroup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         selectionType:
 *           type: string
 *           enum: [single, multiple]
 *         isRequired:
 *           type: boolean
 *         minSelections:
 *           type: integer
 *         maxSelections:
 *           type: integer
 *         restaurantId:
 *           type: string
 *           format: uuid
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ModifierOption'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 */

// --- Public Routes ---

/**
 * @swagger
 * /api/menu/{restaurantId}/categories:
 *   get:
 *     summary: Get all categories and items for a restaurant (Public)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for category name
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad Request (Invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:restaurantId/categories", categoryCacheMiddleware, menuController.getCategories);

/**
 * @swagger
 * /api/menu/{restaurantId}/items/popular:
 *   get:
 *     summary: Get popular items based on order count
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of popular items to return
 *     responses:
 *       200:
 *         description: Popular items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 */
router.get("/:restaurantId/items/popular", menuCacheMiddleware, menuController.getPopularItems);

/**
 * @swagger
 * /api/menu/{restaurantId}/items:
 *   get:
 *     summary: Get all menu items for a restaurant (Public)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for item name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., price, name)
 *     responses:
 *       200:
 *         description: Successfully retrieved menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:restaurantId/items", menuCacheMiddleware, menuController.getMenuItems);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories/{categoryId}/items:
 *   get:
 *     summary: Get menu items by category
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [orderCount, price, price_desc, name]
 *           default: orderCount
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Category not found
 */
router.get("/:restaurantId/categories/:categoryId/items", menuCacheMiddleware, menuController.getItemsByCategory);

/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}/nutrition:
 *   get:
 *     summary: Get nutritional information for a menu item
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The menu item ID
 *     responses:
 *       200:
 *         description: Nutritional information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     nutritionalInfo:
 *                       type: object
 *                       properties:
 *                         calories:
 *                           type: number
 *                         protein:
 *                           type: string
 *                         carbs:
 *                           type: string
 *                         fat:
 *                           type: string
 *                         fiber:
 *                           type: string
 *                         sodium:
 *                           type: string
 *                         sugar:
 *                           type: string
 *                         cholesterol:
 *                           type: string
 *                     ingredients:
 *                       type: array
 *                       items:
 *                         type: string
 *                     allergens:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Menu item not found
 */
router.get("/:restaurantId/items/:id/nutrition", menuController.getNutritionalInfo);

/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}/related:
 *   get:
 *     summary: Get related menu items based on category
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The menu item ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Maximum number of related items to return
 *     responses:
 *       200:
 *         description: Related items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Menu item not found
 */
router.get("/:restaurantId/items/:id/related", menuController.getRelatedItems);

/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}:
 *   get:
 *     summary: Get a single menu item by ID (Public)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The menu item ID
 *     responses:
 *       200:
 *         description: Menu item details found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Menu item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:restaurantId/items/:id", menuCacheMiddleware, menuController.getMenuItemById);

// --- Protected Routes (Admin) ---

/**
 * @swagger
 * /api/menu/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - restaurantId
 *             properties:
 *               name:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *     
 *               description:
 *                 type: string

 *               displayOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/categories",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [
    check("name", "Name is required")
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    check("restaurantId", "Restaurant ID is required").not().isEmpty(),
    check("displayOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order must be a non-negative integer"),
    check("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
  ],
  invalidateMenuCache,
  menuController.createCategory
);

/**
 * @swagger
 * /api/menu/categories/{id}:
 *   put:
 *     summary: Update an existing category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/categories/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [
    check("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    check("displayOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order must be a non-negative integer"),
    check("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
  ],
  menuController.updateCategory
);

/**
 * @swagger
 * /api/menu/categories/{id}/status:
 *   patch:
 *     summary: Update category status (active/inactive)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/categories/:id/status",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.updateCategoryStatus
);

/**
 * @swagger
 * /api/menu/categories:
 *   get:
 *     summary: Get all categories for admin (Admin)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         description: Filter by restaurant ID
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/categories",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.getCategories
);

/**
 * @swagger
 * /api/menu/items:
 *   get:
 *     summary: Get all menu items (Admin)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/items",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.getMenuItems
);

/**
 * @swagger
 * /api/menu/items:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - restaurantId
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *     
 *               prepTime:
 *                 type: integer
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               isPopular:
 *                 type: boolean
 *               isChefRecommended:
 *                 type: boolean
 *               dietary:
 *                 type: array
 *                 items:
 *                   type: string
 *               isAvailable:
 *                 type: boolean
 *               stockStatus:
 *                 type: string
 *                 enum: [in_stock, low_stock, out_of_stock]
 *     responses:
 *       201:
 *         description: Item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/items",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [
    check("name", "Name is required")
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("Name must be between 2 and 80 characters"),
    check("price", "Price is required")
      .isFloat({ min: 0.01, max: 999999 })
      .withMessage("Price must be between 0.01 and 999999"),
    check("categoryId", "Category ID is required").not().isEmpty(),
    check("restaurantId", "Restaurant ID is required").not().isEmpty(),
    check("prepTime")
      .optional()
      .isInt({ min: 0, max: 240 })
      .withMessage("Preparation time must be between 0 and 240 minutes"),
    check("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
  ],
  menuController.createMenuItem
);

/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               prepTime:
 *                 type: integer
 *               isPopular:
 *                 type: boolean
 *               isChefRecommended:
 *                 type: boolean
 *               dietary:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               stockStatus:
 *                 type: string
 *                 enum: [in_stock, low_stock, out_of_stock]
 *     responses:
 *       200:
 *         description: Menu item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   data:
 *                     $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:restaurantId/items/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [
    check("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("Name must be between 2 and 80 characters"),
    check("price")
      .optional()
      .isFloat({ min: 0.01, max: 999999 })
      .withMessage("Price must be between 0.01 and 999999"),
    check("prepTime")
      .optional()
      .isInt({ min: 0, max: 240 })
      .withMessage("Preparation time must be between 0 and 240 minutes"),
    check("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
  ],
  menuController.updateMenuItem
);

// Multer setup for image uploads with Cloudinary
const multer = require("multer");
const { menuStorage } = require("../config/cloudinary");

const upload = multer({
  storage: menuStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  },
});

/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:restaurantId/items/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.deleteMenuItem
);

// --- Photos ---

/**
 * @swagger
 * /api/menu/items/{id}/photos:
 *   post:
 *     summary: Upload photos for a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Photos uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/items/:id/photos",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.array("photos", 5),
  menuController.uploadMenuItemPhotos
);

/**
 * @swagger
 * /api/menu/items/{id}/photos/{photoId}:
 *   delete:
 *     summary: Delete a photo from a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Photo deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Photo/Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/items/:id/photos/:photoId",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.deleteMenuItemPhoto
);

/**
 * @swagger
 * /api/menu/items/{id}/photos/{photoId}/primary:
 *   patch:
 *     summary: Set a photo as primary for a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Primary photo updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Photo/Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/items/:id/photos/:photoId/primary",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.setMenuItemPrimaryPhoto
);

// --- Modifiers ---

/**
 * @swagger
 * /api/menu/modifier-groups:
 *   get:
 *     summary: Get all modifier groups
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of modifier groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ModifierGroup'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get("/modifier-groups", protect, menuController.getModifierGroups);

/**
 * @swagger
 * /api/menu/modifier-groups:
 *   post:
 *     summary: Create a new modifier group
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - selectionType
 *             properties:
 *               name:
 *                 type: string
 *               selectionType:
 *                 type: string
 *                 enum: [single, multiple]
 *               isRequired:
 *                 type: boolean
 *               minSelections:
 *                 type: integer
 *               maxSelections:
 *                 type: integer
 *               restaurantId:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ModifierOption'
 *     responses:
 *       201:
 *         description: Modifier group created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModifierGroup'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/modifier-groups",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.createModifierGroup
);

/**
 * @swagger
 * /api/menu/modifier-groups/{id}:
 *   put:
 *     summary: Update a modifier group
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               selectionType:
 *                 type: string
 *                 enum: [single, multiple]
 *     responses:
 *       200:
 *         description: Modifier group updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModifierGroup'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/modifier-groups/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.updateModifierGroup
);

/**
 * @swagger
 * /api/menu/modifier-groups/{id}:
 *   delete:
 *     summary: Delete a modifier group
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Modifier group deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/modifier-groups/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.deleteModifierGroup
);

/**
 * @swagger
 * /api/menu/modifier-groups/{groupId}/options:
 *   post:
 *     summary: Add an option to a modifier group
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               priceAdjustment:
 *                 type: number
 *     responses:
 *       201:
 *         description: Option created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModifierOption'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/modifier-groups/:groupId/options",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.createModifierOption
);

/**
 * @swagger
 * /api/menu/modifier-options/{id}:
 *   put:
 *     summary: Update a modifier option
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               priceAdjustment:
 *                 type: number
 *     responses:
 *       200:
 *         description: Option updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModifierOption'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Option not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/modifier-options/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.updateModifierOption
);

/**
 * @swagger
 * /api/menu/items/{id}/modifier-groups:
 *   post:
 *     summary: Attach modifier groups to a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupIds
 *             properties:
 *               groupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: groups attached successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/items/:id/modifier-groups",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.attachModifierGroupToItem
);

/**
 * @swagger
 * /api/menu/items/{id}/nutrition:
 *   put:
 *     summary: Update nutritional information for a menu item (Admin only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nutritionalInfo:
 *                 type: object
 *                 properties:
 *                   calories:
 *                     type: number
 *                     example: 450
 *                   protein:
 *                     type: string
 *                     example: "42g"
 *                   carbs:
 *                     type: string
 *                     example: "28g"
 *                   fat:
 *                     type: string
 *                     example: "26g"
 *                   fiber:
 *                     type: string
 *                     example: "4g"
 *                   sodium:
 *                     type: string
 *                     example: "680mg"
 *                   sugar:
 *                     type: string
 *                     example: "3g"
 *                   cholesterol:
 *                     type: string
 *                     example: "95mg"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Salmon", "Asparagus", "Lemon", "Butter"]
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Fish", "Dairy"]
 *     responses:
 *       200:
 *         description: Nutritional information updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Menu item not found
 */
router.put(
  "/items/:id/nutrition",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  menuController.updateNutritionalInfo
);

module.exports = router;
