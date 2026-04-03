export type FoodType = 'veg' | 'non-veg' | 'both';

export interface Restaurant {
  owner: string;

  name: string;
  description?: string;
  phone: string;
  email?: string;

  images?: string[];
  coverImage?: string;

  address: {
    street?: string;
    city: string;
    state?: string;
    pincode?: string;
  };

  location: {
    type: 'Point';
    coordinates: number[]; // [lng, lat]
  };

  routes?: string[];
  routeWaypointOrder?: number;

  foodType: FoodType;
  cuisines?: string[];

  rating: number;
  totalRatings: number;

  isOpen: boolean;
  isActive: boolean;
  isVerified: boolean;

  openingHours: {
    open: string;
    close: string;
  };

  gstNumber?: string;
  gstRate: number;

  avgPrepTimeMinutes: number;

  totalOrders: number;
  totalEarnings: number;

  createdAt: string;
  updatedAt: string;
}