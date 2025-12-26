const express = require('express');
const { check } = require('express-validator');
const menuController = require('../controllers/menu.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management
 */

// --- Public Routes ---

/**
 * @swagger
 * /api/menu/{restaurantId}/categories:
 *   get:
 *     summary: Get all categories and items for a restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories with items
 */
router.get('/:restaurantId/categories', menuController.getCategories);

/**
 * @swagger
 * /api/menu/{restaurantId}/items:
 *   get:
 *     summary: Get all menu items for a restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/:restaurantId/items', menuController.getMenuItems);


/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}:
 *   get:
 *     summary: Get a menu item by ID for a restaurant
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
 *         description: Menu item found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Menu item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/:restaurantId/items/:id', menuController.getMenuItemById);

// --- Protected Routes (Admin) ---

/**
 * @swagger
 * /api/menu/categories:
 *   post:
 *     summary: Create a category
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
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
    '/categories',
    protect,
    authorize('ADMIN', 'SUPER_ADMIN'),
    menuController.createCategory
);

/**
 * @swagger
 * /api/menu/items:
 *   post:
 *     summary: Create a menu item
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
 *     responses:
 *       201:
 *         description: Item created
 */
router.post(
    '/items',
    protect,
    authorize('ADMIN', 'SUPER_ADMIN'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('price', 'Price must be a number').isNumeric(),
        check('categoryId', 'Category ID is required').not().isEmpty(),
        check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
    ],
    menuController.createMenuItem
);

/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}:
 *   put:
 *     summary: Update a menu item by ID for a restaurant
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
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
 *               price:
 *                 type: number
 *               image:
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
 *               isAvailable:
 *                 type: boolean
 *               stockStatus:
 *                 type: string
 *               categoryId:
 *                 type: string
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
 *                 data:
 *                   type: object
 *       404:
 *         description: Menu item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.put('/:restaurantId/items/:id',
    protect, authorize('ADMIN', 'SUPER_ADMIN'),
    menuController.updateMenuItem);

/**
 * @swagger
 * /api/menu/{restaurantId}/items/{id}:
 *   delete:
 *     summary: Delete a menu item by ID for a restaurant
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
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
 *         description: Menu item deleted
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
 *         description: Menu item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, 'menu-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

router.delete('/:restaurantId/items/:id',
    protect, authorize('ADMIN', 'SUPER_ADMIN'),
    menuController.deleteMenuItem);

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
 *         description: Menu Item ID
 *     requestBody:
 *       content:
 *         transport/form-data:
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
 *         description: Photos uploaded
 */
router.post('/items/:id/photos',
    protect, authorize('ADMIN', 'SUPER_ADMIN'),
    upload.array('photos', 5),
    menuController.uploadMenuItemPhotos
);

/**
 * @swagger
 * /api/menu/items/{id}/photos/{photoId}:
 *   delete:
 *     summary: Delete a menu item photo
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu Item ID
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Photo deleted
 */
router.delete('/items/:id/photos/:photoId',
    protect, authorize('ADMIN', 'SUPER_ADMIN'),
    menuController.deleteMenuItemPhoto
);

/**
 * @swagger
 * /api/menu/items/{id}/photos/{photoId}/primary:
 *   patch:
 *     summary: Set a photo as primary
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu Item ID
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Primary photo updated
 */
router.patch('/items/:id/photos/:photoId/primary',
    protect, authorize('ADMIN', 'SUPER_ADMIN'),
    menuController.setMenuItemPrimaryPhoto
);

// --- Modifiers ---

/**
 * @swagger
 * /api/menu/modifier-groups:
 *   get:
 *     summary: Get all modifier groups for the restaurant
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         description: Optional for Super Admin
 *     responses:
 *       200:
 *         description: List of modifier groups
 */
router.get('/modifier-groups', protect, menuController.getModifierGroups);

/**
 * @swagger
 * /api/menu/modifier-groups:
 *   post:
 *     summary: Create a modifier group
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
 *               - selection_type
 *             properties:
 *               name:
 *                 type: string
 *               selection_type:
 *                 type: string
 *                 enum: [single, multiple]
 *               is_required:
 *                 type: boolean
 *               min_selections:
 *                 type: integer
 *               max_selections:
 *                 type: integer
 *               restaurantId:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price_adjustment:
 *                       type: number
 *     responses:
 *       201:
 *         description: Group created
 */
router.post('/modifier-groups', protect, authorize('ADMIN', 'SUPER_ADMIN'), menuController.createModifierGroup);

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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               selection_type:
 *                 type: string
 *               is_required:
 *                 type: boolean
 *               min_selections:
 *                 type: integer
 *               max_selections:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Group updated
 */
router.put('/modifier-groups/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), menuController.updateModifierGroup);

/**
 * @swagger
 * /api/menu/modifier-groups/{groupId}/options:
 *   post:
 *     summary: Add option to modifier group
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
 *               price_adjustment:
 *                 type: number
 *     responses:
 *       201:
 *         description: Option created
 */
router.post('/modifier-groups/:groupId/options', protect, authorize('ADMIN', 'SUPER_ADMIN'), menuController.createModifierOption);

/**
 * @swagger
 * /api/menu/modifier-options/{id}:
 *   put:
 *     summary: Update modifier option
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price_adjustment:
 *                 type: number
 *     responses:
 *       200:
 *         description: Option updated
 */
router.put('/modifier-options/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), menuController.updateModifierOption);

/**
 * @swagger
 * /api/menu/items/{id}/modifier-groups:
 *   post:
 *     summary: Attach modifier groups to item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu Item ID
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
 *         description: Groups attached
 */
router.post('/items/:id/modifier-groups', protect, authorize('ADMIN', 'SUPER_ADMIN'), menuController.attachModifierGroupToItem);

module.exports = router;
