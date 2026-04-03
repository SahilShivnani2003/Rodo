import { MainTabParamList } from "./MainTabParamList";
import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
    splash: undefined;
    welcome: undefined;
    login: undefined;
    otpLogin: {
        phone: string;
    };
    loginSuccess: undefined;
    main: NavigatorScreenParams<MainTabParamList>;
    menu: undefined;
    cart: undefined;
}; 