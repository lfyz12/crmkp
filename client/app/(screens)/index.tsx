import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window'); // Получаем ширину экрана

const Index: React.FC = () => {
    const router = useRouter();

    const menuItems = [
        { id: 1, title: 'Клиенты', icon: 'account-group', color: '#A5D6A7', route: '/Clients' },
        { id: 2, title: 'Заметки', icon: 'note-text', color: '#FFCC80', route: '/Notes' },
        { id: 3, title: 'Взаимодействия', icon: 'phone-in-talk', color: '#80DEEA', route: '/Interactions' },
        { id: 4, title: 'История заказов', icon: 'history', color: '#CE93D8', route: '/OrderHistory' },
    ];

    return (
        <View style={styles.container}>
            {/* Добро пожаловать */}
            <Text style={styles.welcomeText}>Добро пожаловать</Text>

            {/* Контейнер с меню */}
            <View style={styles.menuWrapper}>
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: item.color }]}
                            onPress={() => router.push(item.route)}
                            activeOpacity={0.8}
                        >
                            {/* Иконки теперь темного цвета */}
                            <Icon name={item.icon} size={35} color="#333" />
                            <Text style={[styles.menuText, { color: '#333' }]}>{item.title}</Text> {/* Темный текст */}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 15,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: '600',
        color: '#333',  // Темно-серый цвет для текста
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 15,
    },
    menuWrapper: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        paddingHorizontal: 20,
        paddingVertical: 30,
        marginTop: 30,
    },
    menuContainer: {
        flexDirection: 'column',
        justifyContent: 'center', // Центрируем элементы по вертикали
        alignItems: 'center', // Центрируем элементы по горизонтали
    },
    menuItem: {
        width: width - 40, // Растягиваем на почти всю ширину экрана с учетом отступов
        height: 120,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
    },
});
