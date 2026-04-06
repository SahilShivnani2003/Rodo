import { Colors } from '@/theme';
import { RootStackParamList } from '@/types/RootStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

type registerProps = NativeStackScreenProps<RootStackParamList, 'register'>;

const RegisterScreen = ({ navigation }: registerProps) => {

    const [formData, setFomData] = useState();
    const handleNavigation = () => {
        navigation.navigate('login');
    };
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        ></KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
});

export default RegisterScreen;
