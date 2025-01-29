import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    Animated,
    ScrollView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

const Index: React.FC = () => {
    const router = useRouter();
    const scaleAnim = new Animated.Value(1);
    const { isLoggedIn, logout } = useAuth();

    const menuItems = [
        { id: 1, title: 'Клиенты', icon: 'account-group', colors: ['#4A90E2', '#4169E1'], route: '/Clients' },
        { id: 2, title: 'Заметки', icon: 'note-text', colors: ['#32CD32', '#228B22'], route: '/Notes' },
        { id: 3, title: 'Взаимодействия', icon: 'phone-in-talk', colors: ['#FF6B6B', '#FF4500'], route: '/Interactions' },
        { id: 4, title: 'История заказов', icon: 'history', colors: ['#9370DB', '#6A5ACD'], route: '/OrderHistory' },
    ];

    const cardSize = (width - 40) / 2;
    const aspectRatio = 1;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#F8F9FA', '#E9ECEF']}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Добро пожаловать</Text>
                    <Text style={styles.subTitle}>Управляйте вашими клиентами</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.grid}>
                        {menuItems.map((item) => (
                            <Animated.View
                                key={item.id}
                                style={[
                                    styles.cardContainer,
                                    {
                                        width: cardSize,
                                        height: cardSize * aspectRatio,
                                        marginBottom: 8
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.card}
                                    onPressIn={handlePressIn}
                                    onPressOut={handlePressOut}
                                    onPress={() => router.push(item.route)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={item.colors}
                                        style={styles.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Icon
                                            name={item.icon}
                                            size={isSmallScreen ? 28 : 32}
                                            color="white"
                                            style={styles.icon}
                                        />
                                        <Text style={styles.cardTitle}>
                                            {item.title}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    {isLoggedIn ? (
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={logout}
                        >
                            <Icon name="exit-to-app" size={20} color="#007AFF" />
                            <Text style={styles.searchText}>Выход</Text>
                        </TouchableOpacity>
                    ) : (
                        <Link href="/Login" style={styles.loginLink}>
                            <Text style={styles.loginText}>Войти в систему</Text>
                            <Icon name="chevron-right" size={20} color="#007AFF" />
                        </Link>
                    )}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    header: {
        marginBottom: isSmallScreen ? 16 : 24,
        paddingTop: isSmallScreen ? 12 : 24,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: isSmallScreen ? 26 : 30,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 4,
    },
    subTitle: {
        fontSize: isSmallScreen ? 14 : 16,
        color: '#6B6B6B',
        textAlign: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    cardContainer: {
        marginVertical: 4,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    icon: {
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        lineHeight: 20,
    },
    loginLink: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(0,122,255,0.1)',
    },
    loginText: {
        color: '#007AFF',
        fontSize: 15,
        fontWeight: '500',
        marginRight: 6,
    },
    footer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(0,122,255,0.1)',
    },
    searchText: {
        color: '#007AFF',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 6,
    },
});

export default Index;