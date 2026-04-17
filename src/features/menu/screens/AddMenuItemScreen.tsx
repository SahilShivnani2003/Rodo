import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    Switch,
} from 'react-native';
import { Colors, Radius, Shadow } from '@theme/index';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MenuItem, FoodType, CreateMenuItemDTO } from '../types/MenuItem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useAddMenu } from '../hooks/useAddMenu';
import { useUpdateMenu } from '../hooks/useUpdateMenu';
import { useDeleteMenu } from '../hooks/useDeleteMenu';

type RouteParams = { item?: MenuItem & { _id: string } };

const CATEGORIES = ['Starters', 'Biryani', 'Mains', 'Breads', 'Beverages', 'Desserts', 'Snacks'];

const FOOD_TYPES: { value: FoodType; label: string; color: string; icon: string }[] = [
    { value: 'veg', label: 'Veg', color: Colors.vegGreen, icon: '🟢' },
    { value: 'non-veg', label: 'Non-Veg', color: Colors.brandRed, icon: '🔴' },
    { value: 'egg', label: 'Egg', color: '#D97706', icon: '🟡' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function FieldLabel({ label, required }: { label: string; required?: boolean }) {
    return (
        <Text style={styles.label}>
            {label}
            {required && <Text style={styles.labelRequired}> *</Text>}
        </Text>
    );
}

function Field({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline,
    required,
}: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    keyboardType?: any;
    multiline?: boolean;
    required?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={styles.fieldWrap}>
            <FieldLabel label={label} required={required} />
            <TextInput
                style={[
                    styles.input,
                    focused && styles.inputFocused,
                    multiline && styles.inputMulti,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </View>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionCardTitle}>{title}</Text>
            {children}
        </View>
    );
}

type AddMenuItemScreenProps = NativeStackScreenProps<RootStackParamList, 'addMenuItem'>;
// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AddMenuItemScreen({ navigation }: AddMenuItemScreenProps) {
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const existing = route.params?.item;
    const isEdit = !!existing;

    const { mutate: addMenu } = useAddMenu();
    const { mutate: updateMenu } = useUpdateMenu();
    const { mutate: deleteMenu } = useDeleteMenu();
    const [name, setName] = useState(existing?.name ?? '');
    const [description, setDescription] = useState(existing?.description ?? '');
    const [category, setCategory] = useState(existing?.category ?? '');
    const [price, setPrice] = useState(String(existing?.price ?? ''));
    const [discountedPrice, setDiscountedPrice] = useState(String(existing?.discountedPrice ?? ''));
    const [foodType, setFoodType] = useState<FoodType>(existing?.foodType ?? 'veg');
    const [prepTime, setPrepTime] = useState(String(existing?.preparationTime ?? ''));
    const [tags, setTags] = useState(existing?.tags?.join(', ') ?? '');
    const [isPopular, setIsPopular] = useState(existing?.isPopular ?? false);
    const [isAvailable, setIsAvailable] = useState(existing?.isAvailable ?? true);
    const [loading, setLoading] = useState(false);

    const isValid = name.trim() && category && price && foodType;

    const handleSave = () => {
        if (!isValid) return;
        setLoading(true);
        const data: CreateMenuItemDTO = {
            name: name.trim(),
            description: description.trim(),
            category: category,
            price: +price,
            discountedPrice: discountedPrice ? +discountedPrice : undefined,
            foodType,
            preparationTime: +prepTime,
            tags: tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t),
            isPopular,
            isAvailable,
        };

        if (isEdit && existing?._id) {
            updateMenu(
                { id: existing._id, data },
                {
                    onSuccess: () => {
                        navigation.goBack();
                    },
                }
            );
        } else {
            addMenu(data, {
                onSuccess: () => {
                    navigation.goBack();
                },
            });
        }

    };

    const handleDelete = () => {
        if (!existing?._id) return;
        deleteMenu(existing._id, {
            onSuccess: () => {
                navigation.goBack();
            },
        });
    }

    const discount =
        price && discountedPrice ? Math.round(((+price - +discountedPrice) / +price) * 100) : 0;

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEdit ? 'Edit Item' : 'Add Menu Item'}</Text>
                <View style={{ width: 42 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Basic info ── */}
                <SectionCard title="📝 Basic Info">
                    <Field
                        label="Item Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Chicken Tikka"
                        required
                    />
                    <Field
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Short description of the dish"
                        multiline
                    />
                </SectionCard>

                {/* ── Food type ── */}
                <SectionCard title="🍽 Food Type">
                    <FieldLabel label="Select Type" required />
                    <View style={styles.foodTypeRow}>
                        {FOOD_TYPES.map(ft => (
                            <TouchableOpacity
                                key={ft.value}
                                style={[
                                    styles.foodTypeChip,
                                    foodType === ft.value && {
                                        borderColor: ft.color,
                                        backgroundColor: ft.color + '18',
                                    },
                                ]}
                                onPress={() => setFoodType(ft.value)}
                            >
                                <Text>{ft.icon}</Text>
                                <Text
                                    style={[
                                        styles.foodTypeLabel,
                                        foodType === ft.value && {
                                            color: ft.color,
                                            fontWeight: '800',
                                        },
                                    ]}
                                >
                                    {ft.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SectionCard>

                {/* ── Category ── */}
                <SectionCard title="📂 Category">
                    <FieldLabel label="Select Category" required />
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.catChip, category === c && styles.catChipActive]}
                                onPress={() => setCategory(c)}
                            >
                                <Text
                                    style={[
                                        styles.catChipText,
                                        category === c && styles.catChipTextActive,
                                    ]}
                                >
                                    {c}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SectionCard>

                {/* ── Pricing ── */}
                <SectionCard title="💰 Pricing">
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Field
                                label="MRP (₹)"
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0"
                                keyboardType="numeric"
                                required
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Field
                                label="Discounted Price (₹)"
                                value={discountedPrice}
                                onChangeText={setDiscountedPrice}
                                placeholder="Optional"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    {discount > 0 && (
                        <View style={styles.discountInfo}>
                            <Text style={styles.discountInfoText}>
                                🎉 Customer saves {discount}% — shown as ₹{discountedPrice} (was ₹
                                {price})
                            </Text>
                        </View>
                    )}
                </SectionCard>

                {/* ── Preparation ── */}
                <SectionCard title="⏱ Preparation">
                    <Field
                        label="Prep Time (minutes)"
                        value={prepTime}
                        onChangeText={setPrepTime}
                        placeholder="e.g. 15"
                        keyboardType="numeric"
                        required
                    />
                    <Field
                        label="Tags (comma separated)"
                        value={tags}
                        onChangeText={setTags}
                        placeholder="e.g. Spicy, Bestseller, Chef Special"
                    />
                </SectionCard>

                {/* ── Availability & Flags ── */}
                <SectionCard title="🔧 Settings">
                    <View style={styles.toggleRow}>
                        <View>
                            <Text style={styles.toggleLabel}>Mark as Popular</Text>
                            <Text style={styles.toggleSub}>Shows ⭐ badge on the menu</Text>
                        </View>
                        <Switch
                            value={isPopular}
                            onValueChange={setIsPopular}
                            trackColor={{ false: Colors.border, true: Colors.amberLight }}
                            thumbColor={isPopular ? Colors.amber : Colors.textMuted}
                        />
                    </View>
                    <View
                        style={[
                            styles.toggleRow,
                            {
                                borderTopWidth: 1,
                                borderTopColor: Colors.border,
                                marginTop: 8,
                                paddingTop: 12,
                            },
                        ]}
                    >
                        <View>
                            <Text style={styles.toggleLabel}>Currently Available</Text>
                            <Text style={styles.toggleSub}>Customers can order this item</Text>
                        </View>
                        <Switch
                            value={isAvailable}
                            onValueChange={setIsAvailable}
                            trackColor={{ false: '#FECACA', true: '#86EFAC' }}
                            thumbColor={isAvailable ? Colors.successGreen : '#EF4444'}
                        />
                    </View>
                </SectionCard>

                {/* ── Save ── */}
                <TouchableOpacity
                    style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    activeOpacity={0.85}
                >
                    <Text style={styles.saveBtnText}>
                        {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add to Menu'}
                    </Text>
                    {!loading && <Text style={styles.saveBtnArrow}>→</Text>}
                </TouchableOpacity>

                {isEdit && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Text style={styles.deleteBtnText}>🗑 Delete Item</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.bg },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 28 : 60,
        paddingBottom: 16,
        backgroundColor: Colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.card,
    },
    backIcon: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },
    headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },

    content: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

    sectionCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        gap: 12,
        ...Shadow.card,
    },
    sectionCardTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 4,
        letterSpacing: 0.2,
    },

    fieldWrap: { gap: 6 },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    labelRequired: { color: Colors.brandRed },
    input: {
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    inputFocused: { borderColor: Colors.amber, backgroundColor: '#FFFAF6' },
    inputMulti: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },

    row: { flexDirection: 'row', gap: 12 },

    // Food type
    foodTypeRow: { flexDirection: 'row', gap: 10 },
    foodTypeChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: Radius.md,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: Colors.bgInput,
    },
    foodTypeLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

    // Category
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.bgInput,
    },
    catChipActive: { borderColor: Colors.amber, backgroundColor: Colors.amberGlow },
    catChipText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
    catChipTextActive: { color: Colors.textPrimary },

    // Discount info
    discountInfo: {
        backgroundColor: '#DCFCE7',
        borderRadius: Radius.sm,
        padding: 10,
        borderWidth: 1,
        borderColor: '#86EFAC',
    },
    discountInfoText: { fontSize: 12, color: Colors.successGreen, fontWeight: '600' },

    // Toggles
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    toggleSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

    // Save
    saveBtn: {
        backgroundColor: Colors.amber,
        borderRadius: Radius.md,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadow.amber,
    },
    saveBtnDisabled: { backgroundColor: Colors.textMuted, shadowOpacity: 0, elevation: 0 },
    saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    saveBtnArrow: { fontSize: 18, color: '#fff', fontWeight: '700' },

    deleteBtn: {
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: '#FECACA',
        backgroundColor: '#FFF1F2',
    },
    deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
});
