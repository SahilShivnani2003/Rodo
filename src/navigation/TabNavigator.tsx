import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/dashboard/screens/DashboardScreen';
import RestaurantListScreen from '../features/restaurant/screens/RestaurantScreen';
import OrderTrackingScreen from '../features/orders/screens/OrderScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { CustomTabBar } from '../components/BottomTabBar';
import { MainTabParamList } from '@/types/MainTabParamList';
import { ITabItem } from '@/types/TabItems';

export const USER_TABS: ITabItem[] = [
    {
        name: 'home',
        label: 'Home',
        icon: 'home-outline',
        activeIcon: 'home',
        iconFamily: 'MaterialCommunityIcons',
    },
    {
        name: 'restaurants',
        label: 'Restaurants',
        icon: 'silverware-fork-knife',
        activeIcon: 'silverware-fork-knife',
        iconFamily: 'MaterialCommunityIcons',
    },
    {
        name: 'orders',
        label: 'Orders',
        icon: 'shopping-outline',
        activeIcon: 'shopping',
        iconFamily: 'MaterialCommunityIcons',
        badge: 2,
    },
    {
        name: 'profile',
        label: 'Profile',
        icon: 'account-outline',
        activeIcon: 'account',
        iconFamily: 'MaterialCommunityIcons',
    },
];

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} tabs={USER_TABS} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="home" component={HomeScreen} />
            <Tab.Screen name="restaurants" component={RestaurantListScreen} />
            <Tab.Screen name="orders" component={OrderTrackingScreen} />
            <Tab.Screen name="profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
