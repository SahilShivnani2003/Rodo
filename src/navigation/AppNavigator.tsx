import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { AlertProvider } from '@/providers/AlertProvider';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import LoginSuccessScreen from '@/features/auth/screens/LoginSuccesScreen';
import OTPScreen from '@/features/auth/screens/OtpScreen';
import CartScreen from '@/features/cart/screens/CartScreen';
import MenuScreen from '@/features/menu/screens/MenuScreen';
import SplashScreen from '@/screens/splashScreen';
import WelcomeScreen from '@/screens/WelcomeScreen';
import TabNavigator from './TabNavigator';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
import OwnerTabNavigator from './OwnerTabNavigator';
import CouponsScreen from '@/features/coupons/screens/CouponsScreen';
import AddMenuItemScreen from '@/features/menu/screens/AddMenuItemScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <QueryClientProvider client={queryClient}>
            <AlertProvider>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="splash" component={SplashScreen} />
                        <Stack.Screen name="welcome" component={WelcomeScreen} />
                        <Stack.Screen name="login" component={LoginScreen} />
                        <Stack.Screen name="register" component={RegisterScreen} />
                        <Stack.Screen name="loginSuccess" component={LoginSuccessScreen} />
                        <Stack.Screen name="otpLogin" component={OTPScreen} />
                        <Stack.Screen name="main" component={TabNavigator} />
                        <Stack.Screen name="menu" component={MenuScreen} />
                        <Stack.Screen name="cart" component={CartScreen} />
                        <Stack.Screen name="owner" component={OwnerTabNavigator} />
                        <Stack.Screen name="coupons" component={CouponsScreen} />
                        <Stack.Screen name="addMenuItem" component={AddMenuItemScreen}/>
                    </Stack.Navigator>
                </NavigationContainer>
            </AlertProvider>
        </QueryClientProvider>
    );
}
