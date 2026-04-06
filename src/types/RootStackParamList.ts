import { MainTabParamList } from "./MainTabParamList";
import { NavigatorScreenParams } from "@react-navigation/native";
import { OwnerTabParamList } from "./OwnerTabParamList";

export type RootStackParamList = {
    splash: undefined;
    welcome: undefined;
    login: undefined;
    register: undefined;
    otpLogin: {
        phone: string;
    };
    loginSuccess: undefined;
    main: NavigatorScreenParams<MainTabParamList>;
    menu: undefined;
    cart: undefined;
    owner: NavigatorScreenParams<OwnerTabParamList>;
    coupons: undefined;
    addMenuItem: undefined;
}; 