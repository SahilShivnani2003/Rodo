import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/dashboard/screens/DashboardScreen';
import RestaurantListScreen from '../features/restaurant/screens/RestaurantScreen';
import OrderTrackingScreen from '../features/orders/screens/OrderScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { CustomTabBar } from '../components/BottomTabBar';
import { MainTabParamList } from '@/types/MainTabParamList';

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
