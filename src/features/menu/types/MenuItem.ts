export type FoodType = 'veg' | 'non-veg' | 'egg';

export interface MenuItem {
    restaurant: string;

    name: string;
    description?: string;
    category: string;

    price: number;
    discountedPrice?: number;

    image?: string;

    foodType: FoodType;

    isAvailable: boolean;
    isPopular: boolean;

    preparationTime: number;

    tags?: string[];

    sortOrder: number;

    createdAt: string;
    updatedAt: string;
}