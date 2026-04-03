export type FoodType = 'veg' | 'non-veg' | 'egg';

export interface OrderItem {
    menuItem: string;
    name: string;
    price: number;
    quantity: number;
    foodType?: FoodType;
}

export type OrderType = 'dine-in' | 'takeaway';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | 'rejected';

export type PaymentMethod = 'cash' | 'upi_at_restaurant' | 'online';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderStatusHistory {
    status?: string;
    timestamp: string;
    note?: string;
}

export interface Order {
    orderNumber?: string;

    customer: string;
    restaurant: string;

    items: OrderItem[];

    subtotal: number;
    gstAmount: number;
    gstRate: number;
    discount: number;
    totalAmount: number;

    coupon?: string;
    couponCode?: string;

    orderType: OrderType;

    customerETA: string;
    etaMinutes?: number;

    status: OrderStatus;
    statusHistory?: OrderStatusHistory[];

    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentTransactionId?: string;

    customerLocation?: {
        lat?: number;
        lng?: number;
        distanceFromRestaurantKm?: number;
    };

    tripRoute?: string;

    rejectionReason?: string;

    isManualOrder: boolean;
    createdBy?: string;

    createdAt: string;
    updatedAt: string;
}