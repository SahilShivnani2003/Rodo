import { MainTabParamList } from "./MainTabParamList";
import { OwnerTabParamList } from "./OwnerTabParamList";

export type ITabItem = {
    name: keyof MainTabParamList | keyof OwnerTabParamList;
    label: string;
    icon: string;          // inactive icon name
    activeIcon: string;    // active icon name
    iconFamily: 'MaterialCommunityIcons' | 'Ionicons';
    badge?: number;
};