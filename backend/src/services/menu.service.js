const { prisma } = require("../config/database");
const fs = require("fs");
const path = require("path");

class MenuService {
  // --- Helper method to calculate rating stats ---
  async _calculateRatingStats(menuItemId) {
    const reviews = await prisma.review.findMany({
      where: { menuItemId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    return { averageRating, reviewCount: reviews.length };
  }

  // --- Categories ---
  async getCategories(restaurantId, options = {}) {
    const {
      includeInactive = true,
      page,
      limit,
      sortBy = "displayOrder",
      search,
    } = options;

    const where = { restaurantId };

    // For admin, show all categories; for guest, only active ones
    if (!includeInactive) {
      where.isActive = true;
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "name":
        orderBy = { name: "asc" };
        break;
      case "createdAt":
        orderBy = { createdAt: "desc" };
        break;
      case "displayOrder":
      default:
        orderBy = { displayOrder: "asc" };
        break;
    }

    // If pagination is requested
    if (page && limit) {
      const skip = (page - 1) * limit;
      const take = limit;

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          include: {
            menuItems: {
              select: { id: true },
            },
          },
          orderBy,
          skip,
          take,
        }),
        prisma.category.count({ where }),
      ]);

      return {
        data: categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // No pagination - return all
    const categories = await prisma.category.findMany({
      where,
      include: {
        menuItems: {
          select: { id: true },
        },
      },
      orderBy,
    });

    return { data: categories };
  }

  async createCategory(data) {
    // Check if category name already exists for this restaurant
    const existing = await prisma.category.findFirst({
      where: {
        restaurantId: data.restaurantId,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error("Category name already exists for this restaurant");
    }

    return await prisma.category.create({
      data,
    });
  }

  async updateCategory(id, data) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new Error("Category not found");

    return await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder,
      },
    });
  }

  async updateCategoryStatus(id, isActive) {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new Error("Category not found");

    return await prisma.category.update({
      where: { id },
      data: { isActive },
    });
  }

  // --- Menu Items ---
  async getMenuItems(restaurantId, options = {}) {
    const {
      categoryId,
      search,
      status,
      isChefRecommended,
      isPopular,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
    } = options;

    const where = { restaurantId };

    // Filter by category
    if (categoryId) where.categoryId = categoryId;

    // Filter by chef recommendation
    if (isChefRecommended === "true" || isChefRecommended === true) {
      where.isChefRecommended = true;
    }

    // Filter by popular items
    if (isPopular === "true" || isPopular === true) {
      where.isPopular = true;
    }

    // Filter by status - map frontend status to database fields
    if (status) {
      if (status === "available") {
        where.isAvailable = true;
        where.stockStatus = { notIn: ["sold_out", "low_stock"] };
      } else if (status === "low_stock") {
        where.stockStatus = "low_stock";
      } else if (status === "sold_out") {
        where.stockStatus = "sold_out";
      } else if (status === "unavailable") {
        where.isAvailable = false;
      }
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "price":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "createdAt":
        orderBy = { createdAt: "desc" };
        break;
      case "orderCount":
        orderBy = { orderCount: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Fetch items and total count
    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: { category: true, photos: true },
        orderBy,
        skip,
        take,
      }),
      prisma.menuItem.count({ where }),
    ]);

    // Transform items to include computed status field and rating stats
    const transformedItems = await Promise.all(
      items.map(async (item) => {
        let status = "available";
        if (item.stockStatus === "sold_out") {
          status = "sold_out";
        } else if (item.stockStatus === "low_stock") {
          status = "low_stock";
        } else if (!item.isAvailable) {
          status = "unavailable";
        }

        // Calculate rating stats
        const ratingStats = await this._calculateRatingStats(item.id);

        return {
          ...item,
          status, // Add computed status field
          ...ratingStats,
        };
      }),
    );

    return {
      data: transformedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMenuItemById(id) {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        photos: true,
        modifierGroups: {
          include: {
            modifierGroup: {
              include: { options: true },
            },
          },
        },
      },
    });
    if (!item) throw new Error("Menu item not found");

    // Calculate rating stats
    const ratingStats = await this._calculateRatingStats(id);

    // Transform for frontend
    return {
      ...item,
      modifier_groups: item.modifierGroups.map((mg) => mg.modifierGroup),
      ...ratingStats,
    };
  }

  async createMenuItem(data) {
    // Check if category belongs to restaurant
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category || category.restaurantId !== data.restaurantId) {
      throw new Error("Invalid category for this restaurant");
    }

    // Only pass fields that exist in the schema
    const createData = {
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      prepTime: data.prepTime ? parseInt(data.prepTime, 10) : null,
      isPopular: data.isPopular || false,
      isChefRecommended: data.isChefRecommended || false,
      dietary: data.dietary || [],
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      stockStatus: data.stockStatus || "available",
      categoryId: data.categoryId,
      restaurantId: data.restaurantId,
    };

    return await prisma.menuItem.create({
      data: createData,
    });
  }

  async updateMenuItem(id, data) {
    await this.getMenuItemById(id);
    const {
      id: _id,
      createdAt,
      updatedAt,
      categoryId,
      category,
      restaurantId: _restaurantId,
      modifier_groups, // exclude if passed
      photos, // exclude
      ...updateData
    } = data;

    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    return await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteMenuItem(id) {
    // Check existence (simplified, avoiding circular calls if modify getMenuItemById)
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new Error("Menu item not found");

    return await prisma.menuItem.delete({
      where: { id },
    });
  }

  // --- Photos ---
  async uploadMenuItemPhotos(itemId, files) {
    if (!files || files.length === 0) return [];

    // Ensure item exists
    await this.getMenuItemById(itemId);

    const newPhotos = [];
    for (const file of files) {
      // Use Cloudinary URL from uploaded file
      const url = file.path;
      const photo = await prisma.menuItemPhoto.create({
        data: {
          url: url,
          menuItemId: itemId,
          isPrimary: false,
        },
      });
      newPhotos.push(photo);
    }

    // If no primary, set first as primary
    const hasPrimary = await prisma.menuItemPhoto.findFirst({
      where: { menuItemId: itemId, isPrimary: true },
    });
    if (!hasPrimary && newPhotos.length > 0) {
      await this.setMenuItemPrimaryPhoto(itemId, newPhotos[0].id);
      newPhotos[0].isPrimary = true;
    }

    return newPhotos.length === 1 ? newPhotos[0] : newPhotos;
  }

  async deleteMenuItemPhoto(itemId, photoId) {
    const photo = await prisma.menuItemPhoto.findFirst({
      where: { id: photoId, menuItemId: itemId },
    });
    if (!photo) throw new Error("Photo not found");

    // Delete the photo
    await prisma.menuItemPhoto.delete({ where: { id: photoId } });

    // Check if there are any photos left
    const remainingPhotos = await prisma.menuItemPhoto.findMany({
      where: { menuItemId: itemId },
      orderBy: { isPrimary: "desc" },
    });

    if (remainingPhotos.length === 0) {
      await prisma.menuItem.update({
        where: { id: itemId },
        data: { image: null },
      });
    } else {
      // If the deleted photo was primary, set another as primary
      const hasPrimary = remainingPhotos.some((p) => p.isPrimary);
      if (!hasPrimary) {
        // Set the first remaining photo as primary
        await prisma.menuItemPhoto.update({
          where: { id: remainingPhotos[0].id },
          data: { isPrimary: true },
        });
        // Update menuItem.image to new primary photo
        await prisma.menuItem.update({
          where: { id: itemId },
          data: { image: remainingPhotos[0].url },
        });
      } else {
        // If there is still a primary, update menuItem.image to that
        const primaryPhoto = remainingPhotos.find((p) => p.isPrimary);
        await prisma.menuItem.update({
          where: { id: itemId },
          data: { image: primaryPhoto.url },
        });
      }
    }
  }

  async setMenuItemPrimaryPhoto(itemId, photoId) {
    // Unset all
    await prisma.menuItemPhoto.updateMany({
      where: { menuItemId: itemId },
      data: { isPrimary: false },
    });
    // Set new primary
    const photo = await prisma.menuItemPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    // Sync with MenuItem.image
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { image: photo.url },
    });
  }

  // --- Modifiers ---
  async getModifierGroups(restaurantId, options = {}) {
    const { page, limit, search, sortBy = "createdAt" } = options;

    const where = { restaurantId };

    // Search by name
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "name":
        orderBy = { name: "asc" };
        break;
      case "createdAt":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // If pagination is requested
    if (page && limit) {
      const skip = (page - 1) * limit;
      const take = limit;

      const [groups, total] = await Promise.all([
        prisma.modifierGroup.findMany({
          where,
          include: { options: true },
          orderBy,
          skip,
          take,
        }),
        prisma.modifierGroup.count({ where }),
      ]);

      return {
        data: groups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // No pagination - return all
    const groups = await prisma.modifierGroup.findMany({
      where,
      include: { options: true },
      orderBy,
    });

    return { data: groups };
  }

  async createModifierGroup(data) {
    const { options, ...groupData } = data;

    if (!groupData.restaurantId) {
      throw new Error("Restaurant ID is required for Modifier Group");
    }

    let optionsCreate = [];
    if (options && Array.isArray(options)) {
      optionsCreate = options.map((opt) => ({
        name: opt.name,
        priceAdjustment: opt.priceAdjustment || opt.price_adjustment || 0,
      }));
    }

    // Map snake_case to camelCase for Prisma
    return await prisma.modifierGroup.create({
      data: {
        name: groupData.name,
        selectionType: groupData.selectionType || groupData.selection_type,
        isRequired: groupData.isRequired ?? groupData.is_required,
        minSelections: groupData.minSelections ?? groupData.min_selections,
        maxSelections: groupData.maxSelections ?? groupData.max_selections,
        restaurantId: groupData.restaurantId,
        options: {
          create: optionsCreate,
        },
      },
      include: { options: true },
    });
  }

  async updateModifierGroup(id, data) {
    const { options, ...groupData } = data;

    const group = await prisma.modifierGroup.update({
      where: { id },
      data: {
        name: groupData.name,
        selectionType: groupData.selectionType,
        isRequired: groupData.isRequired,
        minSelections: groupData.minSelections,
        maxSelections: groupData.maxSelections,
      },
    });
    return group;
  }

  async deleteModifierGroup(id) {
    // Delete all options first (cascade should handle this, but explicit is safer)
    await prisma.modifierOption.deleteMany({
      where: { modifierGroupId: id },
    });

    // Delete all item associations
    await prisma.menuItemModifierGroup.deleteMany({
      where: { modifierGroupId: id },
    });

    // Delete the group
    await prisma.modifierGroup.delete({
      where: { id },
    });
  }

  async createModifierOption(groupId, data) {
    return await prisma.modifierOption.create({
      data: {
        name: data.name,
        priceAdjustment: data.price_adjustment || 0,
        modifierGroupId: groupId,
      },
    });
  }

  async updateModifierOption(id, data) {
    return await prisma.modifierOption.update({
      where: { id },
      data: {
        name: data.name,
        priceAdjustment: data.price_adjustment,
      },
    });
  }

  async attachModifierGroupToItem(itemId, groupIds) {
    // Sanitize itemId (remove trailing brace if user typo)
    const cleanItemId = itemId.replace(/}/g, "");

    // Delete all existing associations first
    await prisma.menuItemModifierGroup.deleteMany({
      where: {
        menuItemId: cleanItemId,
      },
    });

    // If groupIds is empty, we're done (all modifiers removed)
    if (!groupIds || (Array.isArray(groupIds) && groupIds.length === 0)) {
      return;
    }

    // Create new associations
    const ids = Array.isArray(groupIds) ? groupIds : [groupIds];
    const validIds = ids.filter((gid) => gid); // Remove null/undefined

    if (validIds.length > 0) {
      await prisma.menuItemModifierGroup.createMany({
        data: validIds.map((gid) => ({
          menuItemId: cleanItemId,
          modifierGroupId: gid,
        })),
        skipDuplicates: true,
      });
    }
  }

  // --- Enhanced Methods with Rating Stats ---
  async getMenuItemsWithRatings(restaurantId, options = {}) {
    const result = await this.getMenuItems(restaurantId, options);

    // Add rating stats to each item
    const itemsWithRatings = await Promise.all(
      result.data.map(async (item) => {
        const ratingStats = await this._calculateRatingStats(item.id);
        return { ...item, ...ratingStats };
      }),
    );

    return {
      data: itemsWithRatings,
      pagination: result.pagination,
    };
  }

  async getMenuItemByIdWithRatings(id) {
    const item = await this.getMenuItemById(id);
    const ratingStats = await this._calculateRatingStats(id);
    return { ...item, ...ratingStats };
  }

  // --- Nutritional Information ---
  async getNutritionalInfo(itemId) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        name: true,
        nutritionalInfo: true,
        ingredients: true,
        allergens: true,
      },
    });

    if (!item) throw new Error("Menu item not found");
    return item;
  }

  async updateNutritionalInfo(itemId, data) {
    // Validate item exists
    const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Menu item not found");

    const updateData = {};

    if (data.nutritionalInfo) {
      updateData.nutritionalInfo = data.nutritionalInfo;
    }
    if (data.ingredients !== undefined) {
      updateData.ingredients = data.ingredients;
    }
    if (data.allergens !== undefined) {
      updateData.allergens = data.allergens;
    }

    return await prisma.menuItem.update({
      where: { id: itemId },
      data: updateData,
      select: {
        id: true,
        name: true,
        nutritionalInfo: true,
        ingredients: true,
        allergens: true,
      },
    });
  }

  // --- Related Items ---
  async getRelatedItems(itemId, limit = 6) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { categoryId: true, restaurantId: true, dietary: true },
    });

    if (!item) throw new Error("Menu item not found");

    // Find related items by category, excluding the current item
    const relatedItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: item.restaurantId,
        categoryId: item.categoryId,
        id: { not: itemId },
        isAvailable: true,
      },
      include: {
        photos: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy: { orderCount: "desc" },
      take: limit,
    });

    // Add rating stats
    const itemsWithRatings = await Promise.all(
      relatedItems.map(async (relatedItem) => {
        const ratingStats = await this._calculateRatingStats(relatedItem.id);
        return { ...relatedItem, ...ratingStats };
      }),
    );

    return itemsWithRatings;
  }

  // --- Popular Items ---
  async getPopularItems(restaurantId, limit = 10) {
    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
      },
      include: {
        photos: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy: { orderCount: "desc" },
      take: limit,
    });

    // Add rating stats
    const itemsWithRatings = await Promise.all(
      items.map(async (item) => {
        const ratingStats = await this._calculateRatingStats(item.id);
        return { ...item, ...ratingStats };
      }),
    );

    return itemsWithRatings;
  }

  // --- Items by Category ---
  async getItemsByCategory(restaurantId, categoryId, options = {}) {
    const { page = 1, limit = 20, sortBy = "orderCount" } = options;

    // Verify category exists and belongs to restaurant
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.restaurantId !== restaurantId) {
      throw new Error(
        "Category not found or does not belong to this restaurant",
      );
    }

    const skip = (page - 1) * limit;
    const take = limit;

    let orderBy = {};
    switch (sortBy) {
      case "price":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "orderCount":
      default:
        orderBy = { orderCount: "desc" };
        break;
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: {
          restaurantId,
          categoryId,
          isAvailable: true,
        },
        include: {
          photos: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
        orderBy,
        skip,
        take,
      }),
      prisma.menuItem.count({
        where: {
          restaurantId,
          categoryId,
          isAvailable: true,
        },
      }),
    ]);

    // Add rating stats
    const itemsWithRatings = await Promise.all(
      items.map(async (item) => {
        const ratingStats = await this._calculateRatingStats(item.id);
        return { ...item, ...ratingStats };
      }),
    );

    return {
      data: itemsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new MenuService();
