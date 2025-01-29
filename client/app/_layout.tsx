import { Stack } from "expo-router";
import {StatusBar} from "expo-status-bar";
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {ActivityIndicator, View} from "react-native";
import {useEffect, useState} from "react";
import {AuthProvider} from "@/context/AuthContext";
export default function RootLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);  // Состояние для проверки авторизации

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userStatus = false  // Проверка статуса авторизации
                setIsAuthenticated(userStatus);  // Устанавливаем состояние в зависимости от статуса
            } catch (error) {
                console.error("Ошибка при проверке статуса авторизации:", error);
            }
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
            {/* Если не авторизован — показываем экран авторизации */}
            {isAuthenticated ? (
                <Stack.Screen name="(screens)" />
            ) : (
                <Stack.Screen name="Login" />
            )}
        </Stack>
        </AuthProvider>

    );
}
