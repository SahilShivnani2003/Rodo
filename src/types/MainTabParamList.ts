export type MainTabParamList = {
    home: undefined;
    restaurants: {
        routeId: string;
    } | undefined;
    orders: {
        orderId: string;
    };
    profile: undefined;
};