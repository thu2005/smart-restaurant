const menuService = require("../services/menu.service");
const { validationResult } = require("express-validator");

exports.getCategories = async (req, res, next) => {
  try {
    // For admin routes: get from query or user's restaurant
    // For public routes: get from params
    const restaurantId =
      req.params.restaurantId ||
      req.query.restaurantId ||
      req.user?.restaurantId;

    if (!restaurantId) {
      // If user is authenticated but has no restaurant, return empty result
      if (req.user) {
        return res.status(200).json({ 
          success: true, 
          data: [],
          message: "No restaurant assigned to user"
        });
      }
      // For public routes without params, return 400
      return res
        .status(400)
        .json({ success: false, message: "Restaurant ID is required" });
    }

    const { page, limit, sortBy, search } = req.query;
    const result = await menuService.getCategories(restaurantId, {
      includeInactive: true,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      search,
    });

    // If pagination is used, return with pagination info
    if (page || limit) {
      res.status(200).json({ success: true, ...result });
    } else {
      // Backward compatibility: return just data array
      res.status(200).json({ success: true, data: result.data || result });
    }
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const category = await menuService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { id } = req.params;
    const category = await menuService.updateCategory(id, req.body);
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const category = await menuService.updateCategoryStatus(id, isActive);
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.getMenuItems = async (req, res, next) => {
  try {
    // For admin routes: get from query or user's restaurant
    // For public routes: get from params
    const restaurantId =
      req.params.restaurantId ||
      req.query.restaurantId ||
      req.user?.restaurantId;

    if (!restaurantId) {
      // If user is authenticated but has no restaurant, return empty result
      if (req.user) {
        return res.status(200).json({ 
          success: true, 
          data: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          message: "No restaurant assigned to user"
        });
      }
      // For public routes without params, return 400
      return res
        .status(400)
        .json({ success: false, message: "Restaurant ID is required" });
    }

    const { page, limit, sortBy, search, categoryId, status, isChefRecommended, isPopular } = req.query;
    const result = await menuService.getMenuItems(restaurantId, {
      categoryId,
      search,
      status,
      isChefRecommended,
      isPopular,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sortBy,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getMenuItemById = async (req, res, next) => {
  try {
    const item = await menuService.getMenuItemById(req.params.id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    if (error.message === "Menu item not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const item = await menuService.createMenuItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    if (error.message === "Menu item not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    await menuService.deleteMenuItem(req.params.id);
    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error) {
    if (error.message === "Menu item not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// --- Photos ---
exports.uploadMenuItemPhotos = async (req, res, next) => {
  try {
    const { id: itemId } = req.params;
    const files = req.files;
    const result = await menuService.uploadMenuItemPhotos(itemId, files);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deleteMenuItemPhoto = async (req, res, next) => {
  try {
    const { id: itemId, photoId } = req.params;
    await menuService.deleteMenuItemPhoto(itemId, photoId);
    res.status(200).json({ success: true, message: "Photo deleted" });
  } catch (error) {
    next(error);
  }
};

exports.setMenuItemPrimaryPhoto = async (req, res, next) => {
  try {
    const { id: itemId, photoId } = req.params;
    await menuService.setMenuItemPrimaryPhoto(itemId, photoId);
    res.status(200).json({ success: true, message: "Primary photo updated" });
  } catch (error) {
    next(error);
  }
};

// --- Modifiers ---
exports.getModifierGroups = async (req, res, next) => {
  try {
    const restaurantId =
      req.query.restaurantId || req.body.restaurantId || req.user.restaurantId;
    if (!restaurantId) {
      return res
        .status(400)
        .json({ success: false, message: "Restaurant ID is required" });
    }
    const { page, limit, search, sortBy } = req.query;
    const result = await menuService.getModifierGroups(restaurantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      sortBy,
    });

    // If pagination is used, return with pagination info
    if (page || limit) {
      res.status(200).json({ success: true, ...result });
    } else {
      // Backward compatibility: return just data array
      res.status(200).json({ success: true, data: result.data || result });
    }
  } catch (error) {
    next(error);
  }
};

exports.createModifierGroup = async (req, res, next) => {
  try {
    // Allow restaurantId from body (for super admin) or from user token
    const restaurantId = req.body.restaurantId || req.user.restaurantId;
    const data = { ...req.body, restaurantId };
    const group = await menuService.createModifierGroup(data);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

exports.updateModifierGroup = async (req, res, next) => {
  try {
    const group = await menuService.updateModifierGroup(
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

exports.deleteModifierGroup = async (req, res, next) => {
  try {
    await menuService.deleteModifierGroup(req.params.id);
    res.status(200).json({ success: true, message: "Modifier group deleted" });
  } catch (error) {
    next(error);
  }
};

exports.createModifierOption = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const option = await menuService.createModifierOption(groupId, req.body);
    res.status(201).json({ success: true, data: option });
  } catch (error) {
    next(error);
  }
};

exports.updateModifierOption = async (req, res, next) => {
  try {
    const option = await menuService.updateModifierOption(
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: option });
  } catch (error) {
    next(error);
  }
};

exports.attachModifierGroupToItem = async (req, res, next) => {
  try {
    const { id: itemId } = req.params;
    const { groupIds } = req.body;
    await menuService.attachModifierGroupToItem(itemId, groupIds);
    res
      .status(200)
      .json({ success: true, message: "Modifier groups attached" });
  } catch (error) {
    next(error);
  }
};

// --- Nutritional Information ---
exports.getNutritionalInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await menuService.getNutritionalInfo(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateNutritionalInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await menuService.updateNutritionalInfo(id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// --- Related Items ---
exports.getRelatedItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    const items = await menuService.getRelatedItems(id, limit ? parseInt(limit) : 6);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// --- Popular Items ---
exports.getPopularItems = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { limit } = req.query;
    const items = await menuService.getPopularItems(restaurantId, limit ? parseInt(limit) : 10);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// --- Items by Category ---
exports.getItemsByCategory = async (req, res, next) => {
  try {
    const { restaurantId, categoryId } = req.params;
    const { page, limit, sortBy } = req.query;
    const result = await menuService.getItemsByCategory(
      restaurantId,
      categoryId,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        sortBy,
      }
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
