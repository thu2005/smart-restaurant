const { prisma } = require('../config/database');
const fs = require('fs');
const path = require('path');

class MenuService {
    // --- Categories ---
    async getCategories(restaurantId) {
        return await prisma.category.findMany({
            where: { restaurantId, isActive: true },
            include: {
                menuItems: {
                    where: { isAvailable: true }, // Optional: only available items
                },
            },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async createCategory(data) {
        return await prisma.category.create({
            data,
        });
    }

    // --- Menu Items ---
    async getMenuItems(restaurantId, categoryId = null) {
        const where = { restaurantId };
        if (categoryId) where.categoryId = categoryId;

        return await prisma.menuItem.findMany({
            where,
            include: { category: true },
        });
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
                            include: { options: true }
                        }
                    }
                }
            }
        });
        if (!item) throw new Error('Menu item not found');

        // Transform for frontend
        return {
            ...item,
            modifier_groups: item.modifierGroups.map(mg => mg.modifierGroup)
        };
    }

    async createMenuItem(data) {
        // Check if category belongs to restaurant
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId }
        });

        if (!category || category.restaurantId !== data.restaurantId) {
            throw new Error('Invalid category for this restaurant');
        }

        return await prisma.menuItem.create({
            data,
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
        if (!item) throw new Error('Menu item not found');

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
            // Assuming server serves /uploads
            const url = `/uploads/${file.filename}`;
            const photo = await prisma.menuItemPhoto.create({
                data: {
                    url: url,
                    menuItemId: itemId,
                    isPrimary: false
                }
            });
            newPhotos.push(photo);
        }

        // If no primary, set first as primary
        const hasPrimary = await prisma.menuItemPhoto.findFirst({
            where: { menuItemId: itemId, isPrimary: true }
        });
        if (!hasPrimary && newPhotos.length > 0) {
            await this.setMenuItemPrimaryPhoto(itemId, newPhotos[0].id);
            newPhotos[0].isPrimary = true;
        }

        return newPhotos.length === 1 ? newPhotos[0] : newPhotos;
    }

    async deleteMenuItemPhoto(itemId, photoId) {
        const photo = await prisma.menuItemPhoto.findFirst({
            where: { id: photoId, menuItemId: itemId }
        });
        if (!photo) throw new Error('Photo not found');

        // Delete the photo
        await prisma.menuItemPhoto.delete({ where: { id: photoId } });

        // Check if there are any photos left
        const remainingPhotos = await prisma.menuItemPhoto.findMany({
            where: { menuItemId: itemId },
            orderBy: { isPrimary: 'desc' }
        });

        if (remainingPhotos.length === 0) {
            await prisma.menuItem.update({
                where: { id: itemId },
                data: { image: null }
            });
        } else {
            // If the deleted photo was primary, set another as primary
            const hasPrimary = remainingPhotos.some(p => p.isPrimary);
            if (!hasPrimary) {
                // Set the first remaining photo as primary
                await prisma.menuItemPhoto.update({
                    where: { id: remainingPhotos[0].id },
                    data: { isPrimary: true }
                });
                // Update menuItem.image to new primary photo
                await prisma.menuItem.update({
                    where: { id: itemId },
                    data: { image: remainingPhotos[0].url }
                });
            } else {
                // If there is still a primary, update menuItem.image to that
                const primaryPhoto = remainingPhotos.find(p => p.isPrimary);
                await prisma.menuItem.update({
                    where: { id: itemId },
                    data: { image: primaryPhoto.url }
                });
            }
        }
    }

    async setMenuItemPrimaryPhoto(itemId, photoId) {
        // Unset all
        await prisma.menuItemPhoto.updateMany({
            where: { menuItemId: itemId },
            data: { isPrimary: false }
        });
        // Set new primary
        const photo = await prisma.menuItemPhoto.update({
            where: { id: photoId },
            data: { isPrimary: true }
        });

        // Sync with MenuItem.image
        await prisma.menuItem.update({
            where: { id: itemId },
            data: { image: photo.url }
        });
    }

    // --- Modifiers ---
    async getModifierGroups(restaurantId) {
        return await prisma.modifierGroup.findMany({
            where: { restaurantId },
            include: { options: true }
        });
    }

    async createModifierGroup(data) {
        const { options, ...groupData } = data;

        if (!groupData.restaurantId) {
            throw new Error("Restaurant ID is required for Modifier Group");
        }

        let optionsCreate = [];
        if (options && Array.isArray(options)) {
            optionsCreate = options.map(opt => ({
                name: opt.name,
                priceAdjustment: opt.priceAdjustment || opt.price_adjustment || 0
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
                    create: optionsCreate
                }
            },
            include: { options: true }
        });
    }

    async updateModifierGroup(id, data) {
        const { options, ...groupData } = data;


        const group = await prisma.modifierGroup.update({
            where: { id },
            data: {
                name: groupData.name,
                selectionType: groupData.selection_type,
                isRequired: groupData.is_required,
                minSelections: groupData.min_selections,
                maxSelections: groupData.max_selections
            }
        });
        return group;
    }

    async createModifierOption(groupId, data) {
        return await prisma.modifierOption.create({
            data: {
                name: data.name,
                priceAdjustment: data.price_adjustment || 0,
                modifierGroupId: groupId
            }
        });
    }

    async updateModifierOption(id, data) {
        return await prisma.modifierOption.update({
            where: { id },
            data: {
                name: data.name,
                priceAdjustment: data.price_adjustment
            }
        });
    }

    async attachModifierGroupToItem(itemId, groupIds) {
        if (!groupIds || (Array.isArray(groupIds) && groupIds.length === 0)) {
            throw new Error("groupIds (array of IDs) is required.");
        }

        // Sanitize itemId (remove trailing brace if user typo)
        const cleanItemId = itemId.replace(/}/g, "");

        const ids = Array.isArray(groupIds) ? groupIds : [groupIds];
        for (const gid of ids) {
            if (!gid) continue; // Skip invalid IDs
            const exists = await prisma.menuItemModifierGroup.findUnique({
                where: { menuItemId_modifierGroupId: { menuItemId: cleanItemId, modifierGroupId: gid } }
            });
            if (!exists) {
                await prisma.menuItemModifierGroup.create({
                    data: {
                        menuItemId: cleanItemId,
                        modifierGroupId: gid
                    }
                });
            }
        }
    }

}

module.exports = new MenuService();
