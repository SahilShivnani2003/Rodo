export type MainTabParamList = {
    home: undefined;
    restaurants: {
        routeId: string;
        searchQuery?: string;
    } | undefined;
    orders: {
        orderId: string;
    };
    profile: undefined;
};