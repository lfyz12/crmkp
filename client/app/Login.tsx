import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { userApi } from '@/api/userApi';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';

const { height } = Dimensions.get('window');

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();
    const { login } = useAuth();
    const buttonScale = useSharedValue(1);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Ошибка', 'Заполните все поля');
            return;
        }

        try {
            const userData = { email, password };
            const response = isLogin
                ? await userApi.login(userData)
                : await userApi.register(userData);

            // Сохраняем токен
            await login(response.token);

            Alert.alert('Успех', isLogin ? 'Вход выполнен' : 'Регистрация выполнена');
            router.replace('/(screens)');
        } catch (error) {
            Alert.alert('Ошибка', 'Что-то пошло не так. Попробуйте снова.');
        }
    };

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }]
    }));

    const handlePressIn = () => {
        buttonScale.value = withSpring(0.96);
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1);
    };

    return (
        <View style={styles.container}>
            {/* Фон с плавным градиентом */}
            <LinearGradient
                colors={['#4A90E2', '#F8F9FA']}
                style={styles.background}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.7 }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>
                        {isLogin ? 'Вход' : 'Регистрация'}
                    </Text>

                    <View style={styles.inputsWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#868e96"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Пароль"
                            placeholderTextColor="#868e96"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <Animated.View style={[animatedButtonStyle, styles.buttonWrapper]}>
                        <TouchableOpacity
                            style={styles.button}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={handleLogin}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#4A90E2', '#4169E1']}
                                style={styles.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>
                                    {isLogin ? 'Войти' : 'Продолжить'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setIsLogin(prev => !prev)}
                >
                    <Text style={styles.switchText}>
                        {isLogin
                            ? 'Нет аккаунта? '
                            : 'Уже есть аккаунт? '}
                        <Text style={styles.switchAccent}>
                            {isLogin ? 'Создать аккаунт' : 'Войти'}
                        </Text>
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 32,
        textAlign: 'center',
    },
    inputsWrapper: {
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1a1a1a',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    buttonWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    switchButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        padding: 12,
    },
    switchText: {
        color: '#495057',
        fontSize: 14,
    },
    switchAccent: {
        color: '#4169E1',
        fontWeight: '600',
    },
});

export default Login;