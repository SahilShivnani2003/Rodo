export interface Waypoint {
    _id?: string;
    name: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    order: number;
}

export interface Route {
    _id?: string;
    name: string;
    slug: string;

    fromCity: string;
    toCity: string;

    totalDistanceKm?: number;

    waypoints?: Waypoint[];

    isActive: boolean;

    path?: {
        type: 'LineString';
        coordinates: number[][]; // [[lng, lat], ...]
    };

    createdAt: string;
    updatedAt: string;
}