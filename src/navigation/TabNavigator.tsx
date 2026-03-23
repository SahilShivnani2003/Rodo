import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/tabs/HomeScreen';
import RestaurantListScreen from '../screens/tabs/RestaurantScreen';
import OrderTrackingScreen from '../screens/tabs/OrderScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { CustomTabBar } from '../components/BottomTabBar';

export type MainTabParamList = {
    home: undefined;
    restaurants: undefined;
    orders: undefined;
    profile: undefined;
};

export const TABS: {
    name: keyof MainTabParamList;
    label: string;
    icon: string;
    badge?: number;
}[] = [
    { name: 'home', label: 'Home', icon: '🏠' },
    { name: 'restaurants', label: 'Restaurants', icon: '🍽️' },
    { name: 'orders', label: 'Orders', icon: '📦', badge: 2 },
    { name: 'profile', label: 'Profile', icon: '👤' },
];

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="home" component={HomeScreen} />
            <Tab.Screen name="restaurants" component={RestaurantListScreen} />
            <Tab.Screen name="orders" component={OrderTrackingScreen} />
            <Tab.Screen name="profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
