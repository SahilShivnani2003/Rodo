export type DiscountType = 'percentage' | 'flat';

export type ApplicableTo = 'all' | 'restaurant' | 'route';

export interface Coupon {
    code: string;

    description?: string;

    discountType: DiscountType;
    discountValue: number;

    maxDiscountAmount?: number;
    minOrderAmount: number;

    applicableTo: ApplicableTo;

    restaurant?: string;
    route?: string;

    usageLimit?: number;
    usageCount: number;
    perUserLimit: number;

    validFrom: string;
    validUntil: string;

    isActive: boolean;

    createdBy?: string;

    createdAt: string;
    updatedAt: string;
}