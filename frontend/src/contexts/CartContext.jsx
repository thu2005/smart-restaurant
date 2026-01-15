import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  /**
   * Add item to cart
   * If item with same modifiers exists, increase quantity
   */
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      // Check if item with same ID and modifiers already exists
      const existingItemIndex = prevItems.findIndex(
        (cartItem) =>
          cartItem.menuItemId === item.menuItemId &&
          JSON.stringify(cartItem.modifiers) === JSON.stringify(item.modifiers)
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity || 1;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { ...item, cartId: Date.now() }];
      }
    });
  };

  /**
   * Update item quantity
   */
  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  /**
   * Update full item details (modifiers, notes, etc)
   */
  const updateItem = (cartId, updatedData) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId ? { ...item, ...updatedData, cartId } : item
      )
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (cartId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Get cart summary
   */
  const getCartSummary = () => {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      itemCount,
      subtotal,
      tax: subtotal * 0.1, // 10% tax
      total: subtotal * 1.1,
    };
  };

  /**
   * Calculate Estimated Wait Time
   * Logic: Parallel processing with capacity constraints
   */
  const getEstimatedWaitTime = () => {
    if (cartItems.length === 0) return { min: 0, max: 0 };

    const KITCHEN_CAPACITY = 4; // Max concurrent items
    const SERVING_BUFFER = 5; // Minutes for plating/serving

    // 1. Flatten items based on quantity
    let allTasks = [];
    cartItems.forEach(item => {
      const time = item.prepTime || 15; // Default 15 mins if missing
      for (let i = 0; i < item.quantity; i++) {
        allTasks.push(time);
      }
    });

    // 2. Sort descending (longest tasks first)
    allTasks.sort((a, b) => b - a);

    // 3. Process in batches (Kitchen Capacity)
    let totalPrepTime = 0;
    
    // Chunk array
    for (let i = 0; i < allTasks.length; i += KITCHEN_CAPACITY) {
      const batch = allTasks.slice(i, i + KITCHEN_CAPACITY);
      // The batch takes as long as the longest item in it
      const batchTime = Math.max(...batch);
      totalPrepTime += batchTime;
    }

    // 4. Returns range
    const estimatedMin = totalPrepTime + SERVING_BUFFER;
    const estimatedMax = estimatedMin + 5; // 5 min uncertainty window

    return { min: estimatedMin, max: estimatedMax };
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    updateQuantity,
    updateItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    getEstimatedWaitTime,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
