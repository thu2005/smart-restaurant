import Fuse from "fuse.js";

/**
 * Perform fuzzy search on menu items
 * @param {Array} items - Array of menu items to search
 * @param {string} query - Search query
 * @returns {Array} - Filtered and ranked items
 */
export const fuzzySearchMenuItems = (items, query) => {
  if (!query || query.trim() === "") {
    return items;
  }

  const options = {
    // Keys to search in
    keys: [
      {
        name: "name",
        weight: 0.5, // Name is most important
      },
      {
        name: "description",
        weight: 0.3,
      },
      {
        name: "category_name",
        weight: 0.1,
      },
      {
        name: "dietary",
        weight: 0.05,
      },
      {
        name: "allergens",
        weight: 0.05,
      },
    ],
    // Fuzzy matching options
    threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
    distance: 100, // Maximum distance for matching
    minMatchCharLength: 2, // Minimum character length to match
    includeScore: true, // Include match score in results
    shouldSort: true, // Sort by best match
    ignoreLocation: true, // Don't care where in the string the match is
  };

  const fuse = new Fuse(items, options);
  const results = fuse.search(query);

  // Return just the items (without Fuse's wrapper)
  return results.map((result) => result.item);
};

/**
 * Perform fuzzy search on categories
 * @param {Array} categories - Array of categories to search
 * @param {string} query - Search query
 * @returns {Array} - Filtered categories
 */
export const fuzzySearchCategories = (categories, query) => {
  if (!query || query.trim() === "") {
    return categories;
  }

  const options = {
    keys: ["name", "description"],
    threshold: 0.3,
    distance: 50,
    minMatchCharLength: 2,
    includeScore: true,
    shouldSort: true,
  };

  const fuse = new Fuse(categories, options);
  const results = fuse.search(query);

  return results.map((result) => result.item);
};

export default {
  fuzzySearchMenuItems,
  fuzzySearchCategories,
};
