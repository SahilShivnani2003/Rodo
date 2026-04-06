import { CustomTabBar } from '@/components/BottomTabBar';
import OwnerDashboardScreen from '@/features/dashboard/screens/OwnerDashboardScreen';
import OwnerMenuScreen from '@/features/menu/screens/OwnerMenuScreen';
import OwnerOrdersScreen from '@/features/orders/screens/OwnerOrdersScreen';
import OwnerProfileScreen from '@/features/profile/screens/OwnerProfile';
import { OwnerTabParamList } from '@/types/OwnerTabParamList';
import { ITabItem } from '@/types/TabItems';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export const OWNER_TABS: ITabItem[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        icon: 'view-dashboard-outline',
        activeIcon: 'view-dashboard',
        iconFamily: 'MaterialCommunityIcons',
    },
    {
        name: 'menu',
        label: 'My Menu',
        icon: 'food-outline',
        activeIcon: 'food',
        iconFamily: 'MaterialCommunityIcons',
    },
    {
        name: 'orders',
        label: 'Orders',
        icon: 'clipboard-list-outline',
        activeIcon: 'clipboard-list',
        iconFamily: 'MaterialCommunityIcons',
        badge: 5,
    },
    {
        name: 'profile',
        label: 'Account',
        icon: 'store-outline',
        activeIcon: 'store',
        iconFamily: 'MaterialCommunityIcons',
    },
];

const Tab = createBottomTabNavigator<OwnerTabParamList>();

export default function OwnerTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={props => <CustomTabBar {...props} tabs={OWNER_TABS} />}
        >
            <Tab.Screen name="dashboard" component={OwnerDashboardScreen} />
            <Tab.Screen name="menu" component={OwnerMenuScreen} />
            <Tab.Screen name="orders" component={OwnerOrdersScreen} />
            <Tab.Screen name="profile" component={OwnerProfileScreen} />
        </Tab.Navigator>
    );
}
