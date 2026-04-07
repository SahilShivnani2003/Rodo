import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '@/features/menu/types/MenuItem';

// ─── Constants ────────────────────────────────────────────────────────────────

export const CART_STORAGE_KEY = '@rodo_cart_items';
export const CART_METADATA_KEY = '@rodo_cart_metadata';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem extends MenuItem {
    qty: number;
}

export interface CartMetadata {
    selectedETA: string;
    dineMode: string;
    specialNote: string;
    appliedCoupon: { code: string; discount: number } | null;
}

export interface CartData {
    items: CartItem[];
    metadata: CartMetadata;
}

// ─── Cart Operations ──────────────────────────────────────────────────────────

/**
 * Load cart items from AsyncStorage
 */
export const loadCartItems = async (): Promise<CartItem[]> => {
    try {
        const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (cartData) {
            return JSON.parse(cartData);
        }
        return [];
    } catch (error) {
        console.error('Error loading cart items:', error);
        return [];
    }
};

/**
 * Save cart items to AsyncStorage
 */
export const saveCartItems = async (items: CartItem[]): Promise<boolean> => {
    try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving cart items:', error);
        return false;
    }
};

/**
 * Load cart metadata from AsyncStorage
 */
export const loadCartMetadata = async (): Promise<CartMetadata> => {
    try {
        const metadataData = await AsyncStorage.getItem(CART_METADATA_KEY);
        if (metadataData) {
            return JSON.parse(metadataData);
        }
        return {
            selectedETA: '30 min',
            dineMode: 'Dine-in',
            specialNote: '',
            appliedCoupon: null,
        };
    } catch (error) {
        console.error('Error loading cart metadata:', error);
        return {
            selectedETA: '30 min',
            dineMode: 'Dine-in',
            specialNote: '',
            appliedCoupon: null,
        };
    }
};

/**
 * Save cart metadata to AsyncStorage
 */
export const saveCartMetadata = async (metadata: CartMetadata): Promise<boolean> => {
    try {
        await AsyncStorage.setItem(CART_METADATA_KEY, JSON.stringify(metadata));
        return true;
    } catch (error) {
        console.error('Error saving cart metadata:', error);
        return false;
    }
};

/**
 * Add item to cart
 * If item already exists, increment quantity
 */
export const addToCart = async (item: MenuItem, quantity: number = 1): Promise<CartItem[]> => {
    try {
        const cartItems = await loadCartItems();
        const existingItemIndex = cartItems.findIndex(i => i._id === item._id);

        if (existingItemIndex !== -1) {
            // Item exists, increment quantity
            cartItems[existingItemIndex].qty += quantity;
        } else {
            // New item, add to cart
            cartItems.push({ ...item, qty: quantity });
        }

        await saveCartItems(cartItems);
        return cartItems;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (itemId: string): Promise<CartItem[]> => {
    try {
        const cartItems = await loadCartItems();
        const updatedItems = cartItems.filter(i => i._id !== itemId);
        await saveCartItems(updatedItems);
        return updatedItems;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        throw error;
    }
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = async (
    itemId: string,
    quantity: number,
): Promise<CartItem[]> => {
    try {
        const cartItems = await loadCartItems();
        const itemIndex = cartItems.findIndex(i => i._id === itemId);

        if (itemIndex !== -1) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                return await removeFromCart(itemId);
            } else {
                cartItems[itemIndex].qty = quantity;
                await saveCartItems(cartItems);
            }
        }

        return cartItems;
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        throw error;
    }
};

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<void> => {
    try {
        await Promise.all([
            AsyncStorage.removeItem(CART_STORAGE_KEY),
            AsyncStorage.removeItem(CART_METADATA_KEY),
        ]);
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};

/**
 * Get cart count (total number of items)
 */
export const getCartCount = async (): Promise<number> => {
    try {
        const cartItems = await loadCartItems();
        return cartItems.reduce((total, item) => total + item.qty, 0);
    } catch (error) {
        console.error('Error getting cart count:', error);
        return 0;
    }
};

/**
 * Get cart total price
 */
export const getCartTotal = async (): Promise<{
    subtotal: number;
    gst: number;
    total: number;
}> => {
    try {
        const cartItems = await loadCartItems();
        const metadata = await loadCartMetadata();

        const subtotal = cartItems.reduce((sum, item) => {
            const price = item.discountedPrice || item.price;
            return sum + price * item.qty;
        }, 0);

        const gst = Math.round(subtotal * 0.05);
        const discount = metadata.appliedCoupon?.discount ?? 0;
        const total = subtotal + gst - discount;

        return { subtotal, gst, total };
    } catch (error) {
        console.error('Error calculating cart total:', error);
        return { subtotal: 0, gst: 0, total: 0 };
    }
};

/**
 * Check if item is in cart
 */
export const isItemInCart = async (itemId: string): Promise<boolean> => {
    try {
        const cartItems = await loadCartItems();
        return cartItems.some(i => i._id === itemId);
    } catch (error) {
        console.error('Error checking if item is in cart:', error);
        return false;
    }
};

/**
 * Get item quantity in cart
 */
export const getItemQuantity = async (itemId: string): Promise<number> => {
    try {
        const cartItems = await loadCartItems();
        const item = cartItems.find(i => i._id === itemId);
        return item?.qty ?? 0;
    } catch (error) {
        console.error('Error getting item quantity:', error);
        return 0;
    }
};

/**
 * Load complete cart data (items + metadata)
 */
export const loadCartData = async (): Promise<CartData> => {
    try {
        const [items, metadata] = await Promise.all([loadCartItems(), loadCartMetadata()]);
        return { items, metadata };
    } catch (error) {
        console.error('Error loading cart data:', error);
        return {
            items: [],
            metadata: {
                selectedETA: '30 min',
                dineMode: 'Dine-in',
                specialNote: '',
                appliedCoupon: null,
            },
        };
    }
};

/**
 * Validate cart items (check if all items are still available)
 * This should be called when navigating to cart or before checkout
 */
export const validateCartItems = async (
    availableItems: MenuItem[],
): Promise<{ valid: CartItem[]; invalid: CartItem[] }> => {
    try {
        const cartItems = await loadCartItems();
        const valid: CartItem[] = [];
        const invalid: CartItem[] = [];

        cartItems.forEach(cartItem => {
            const availableItem = availableItems.find(i => i._id === cartItem._id);
            if (availableItem && availableItem.isAvailable) {
                valid.push(cartItem);
            } else {
                invalid.push(cartItem);
            }
        });

        // Update cart with only valid items
        if (invalid.length > 0) {
            await saveCartItems(valid);
        }

        return { valid, invalid };
    } catch (error) {
        console.error('Error validating cart items:', error);
        return { valid: [], invalid: [] };
    }
};