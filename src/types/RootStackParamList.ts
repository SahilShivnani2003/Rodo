import { MainTabParamList } from "./MainTabParamList";
import { NavigatorScreenParams } from "@react-navigation/native";
import { OwnerTabParamList } from "./OwnerTabParamList";
import { MenuItem } from "@/features/menu/types/MenuItem";
import { CartItem } from "@/features/cart/services/cartService";

export type RootStackParamList = {
    splash: undefined;
    welcome: undefined;
    login: undefined;
    register: undefined;
    otpLogin: {
        otp: string;
        phone: string;
    };
    loginSuccess: undefined;
    main: NavigatorScreenParams<MainTabParamList>;
    menu: {
        restaurantId: string
    };
    cart: {
        cartItems: CartItem[]
    };
    owner: NavigatorScreenParams<OwnerTabParamList>;
    coupons: undefined;
    addMenuItem: undefined;
}; 