import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import LoginSuccessScreen from '../screens/auth/LoginSuccesScreen';
import OTPScreen from '../screens/auth/OtpScreen';
import TabNavigator from './TabNavigator';
import MenuScreen from '../screens/MenuScreen';

export type RootStackParamList = {
    splash: undefined;
    welcome: undefined;
    login: undefined;
    otpLogin: {
        phone: string;
    };
    loginSuccess: undefined;
    main: undefined;
    menu: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="splash" component={SplashScreen} />
                <Stack.Screen name="welcome" component={WelcomeScreen} />
                <Stack.Screen name="login" component={LoginScreen} />
                <Stack.Screen name="loginSuccess" component={LoginSuccessScreen} />
                <Stack.Screen name="otpLogin" component={OTPScreen} />
                <Stack.Screen name="main" component={TabNavigator} />
                <Stack.Screen name="menu" component={MenuScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
