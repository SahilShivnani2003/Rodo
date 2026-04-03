import { View, StatusBar, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Shadow, Radius } from '../../../theme';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { MainTabParamList } from '@/types/MainTabParamList';

type profileProps = NativeStackScreenProps<MainTabParamList, 'profile'>;

export function ProfileScreen({ navigation }: profileProps) {
    const menuItems = [
        { icon: '📦', label: 'Order History', onPress: () => {} },
        { icon: '🎟️', label: 'My Coupons', onPress: () => {} },
        { icon: '💬', label: 'Support', onPress: () => {} },
        { icon: '📄', label: 'Terms & Conditions', onPress: () => {} },
        { icon: '🔒', label: 'Privacy Policy', onPress: () => {} },
        {
            icon: '🚪',
            label: 'Log Out',
            onPress: () =>
                navigation
                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                    .replace('welcome'),
            danger: true,
        },
    ];

    return (
        <View style={profileStyles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCard} />

            {/* User card */}
            <View style={profileStyles.header}>
                <View style={profileStyles.avatar}>
                    <Text style={{ fontSize: 38 }}>👤</Text>
                </View>
                <Text style={profileStyles.name}>Rahul Sharma</Text>
                <Text style={profileStyles.phone}>+91 98765 43210</Text>
                <TouchableOpacity style={profileStyles.editBtn}>
                    <Text style={profileStyles.editText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Menu list */}
            {menuItems.map((item, i) => (
                <TouchableOpacity
                    key={item.label}
                    style={[
                        profileStyles.menuItem,
                        i === 0 && profileStyles.menuItemFirst,
                        item.danger && profileStyles.menuItemDanger,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                >
                    <Text style={profileStyles.menuIcon}>{item.icon}</Text>
                    <Text
                        style={[
                            profileStyles.menuLabel,
                            item.danger && profileStyles.menuLabelDanger,
                        ]}
                    >
                        {item.label}
                    </Text>
                    {!item.danger && <Text style={profileStyles.menuArrow}>›</Text>}
                </TouchableOpacity>
            ))}

            <Text style={profileStyles.version}>Rodo v1.0.0</Text>
        </View>
    );
}

const profileStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    header: {
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 24 : 70,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: 8,
        ...Shadow.card,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.amberGlow,
        borderWidth: 2.5,
        borderColor: Colors.borderActive,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        ...Shadow.card,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    phone: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
        marginBottom: 14,
    },
    editBtn: {
        backgroundColor: Colors.amberGlow,
        borderRadius: Radius.full,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: Colors.borderActive,
    },
    editText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.amber,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 17,
        paddingHorizontal: 24,
        backgroundColor: Colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemFirst: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: 8,
    },
    menuItemDanger: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    menuIcon: { fontSize: 20, width: 28 },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    menuLabelDanger: { color: '#DC2626' },
    menuArrow: { fontSize: 20, color: Colors.textMuted },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 28,
        fontWeight: '500',
    },
});
