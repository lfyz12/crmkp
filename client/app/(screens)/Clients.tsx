import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
    StyleSheet,
} from 'react-native';
import { clientApi } from '@/api/clientApi';
import { Client } from '@/api/models';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native'; // Для навигации

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });

    const navigation = useNavigation(); // Используем для навигации

    const fetchClients = async () => {
        try {
            const { data } = await clientApi.getClients();
            setClients(data)
        } catch (error) {
            console.error('Ошибка при загрузке клиентов', error);
        }
    };

    const handleAddClient = async () => {
        try {
            if (newClient.name && newClient.email && newClient.phone) {
                await clientApi.createClient(newClient);
                setIsModalVisible(false);
                setNewClient({ name: '', email: '', phone: '' });
                fetchClients();
            } else {
                alert('Все поля обязательны для заполнения');
            }
        } catch (error) {
            console.error('Ошибка при добавлении клиента', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <View style={styles.container}>
            {/* Стрелка назад */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={28} color="#007AFF" />
            </TouchableOpacity>

            {/* Заголовок */}
            <Text style={styles.headerText}>Клиенты</Text>

            {/* Список клиентов */}
            <FlatList
                data={clients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.clientCard}>
                        <Icon name="account" size={32} color="#007AFF" />
                        <View style={styles.clientInfo}>
                            <Text style={styles.clientName}>{item.name}</Text>
                            <Text style={styles.clientEmail}>{item.email}</Text>
                            <Text style={styles.clientPhone}>{item.phone}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Список клиентов пуст</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* Кнопка Добавить клиента */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsModalVisible(true)}
            >
                <Icon name="plus" size={28} color="#fff" />
                <Text style={styles.addButtonText}>Добавить клиента</Text>
            </TouchableOpacity>

            {/* Модальное окно для добавления клиента */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Добавить клиента</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Имя"
                            value={newClient.name}
                            onChangeText={(text) =>
                                setNewClient((prev) => ({ ...prev, name: text }))
                            }
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={newClient.email}
                            keyboardType="email-address"
                            onChangeText={(text) =>
                                setNewClient((prev) => ({ ...prev, email: text }))
                            }
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Телефон"
                            value={newClient.phone}
                            keyboardType="phone-pad"
                            onChangeText={(text) =>
                                setNewClient((prev) => ({ ...prev, phone: text }))
                            }
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Добавить" onPress={handleAddClient} />
                            <Button
                                title="Отмена"
                                color="red"
                                onPress={() => setIsModalVisible(false)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Clients;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 16,
        zIndex: 1,
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginVertical: 16,
    },
    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    clientInfo: {
        marginLeft: 12,
    },
    clientName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    clientEmail: {
        fontSize: 14,
        color: '#666',
    },
    clientPhone: {
        fontSize: 14,
        color: '#888',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#aaa',
        marginTop: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 30,
        position: 'absolute',
        bottom: 20,
        right: 20,
        elevation: 5,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});
