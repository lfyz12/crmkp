import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
    StyleSheet, Platform, KeyboardAvoidingView, Picker,
} from 'react-native';
import { clientApi } from '@/api/clientApi';
import { Client } from '@/api/models';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {LinearGradient} from "expo-linear-gradient"; // Для навигации

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentClient, setCurrentClient] = useState<Partial<Client>>({
        name: '',
        email: '',
        phone: ''
    });
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });

    const navigation = useNavigation(); // Используем для навигации
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'phone'>('name');
    const [sortAsc, setSortAsc] = useState(true);


    const filteredAndSortedClients = useMemo(() => {
        let result = [...clients];

        // Поиск
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(client =>
                client.name.toLowerCase().includes(lowerQuery) ||
                client.email.toLowerCase().includes(lowerQuery) ||
                client.phone.toLowerCase().includes(lowerQuery)
            );
        }

        // Сортировка
        result.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
            return 0;
        });

        return result;
    }, [clients, searchQuery, sortBy, sortAsc]);
    const renderHeaderControls = () => (
        <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
                <Icon
                    name="magnify"
                    size={20}
                    color="#868e96"
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Поиск клиентов..."
                    placeholderTextColor="#868e96"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.sortContainer}>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setSortAsc(!sortAsc)}
                >
                    <LinearGradient
                        colors={['#007AFF', '#0040FF']}
                        style={styles.sortGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Icon
                            name={sortAsc ? "arrow-up" : "arrow-down"}
                            size={16}
                            color="white"
                        />
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={sortBy}
                        dropdownIconColor="#007AFF"
                        style={styles.sortPicker}
                        onValueChange={(value) => setSortBy(value)}
                    >
                        <Picker.Item
                            label="Сортировка по имени"
                            value="name"
                            style={styles.pickerItem}
                        />
                        <Picker.Item
                            label="Сортировка по email"
                            value="email"
                            style={styles.pickerItem}
                        />
                        <Picker.Item
                            label="Сортировка по телефону"
                            value="phone"
                            style={styles.pickerItem}
                        />
                    </Picker>
                </View>
            </View>
        </View>
    );
    const handleCardPress = (client: Client) => {
        if (isDeleteMode) return;
        setIsEditMode(true);
        setCurrentClient(client);
        setIsModalVisible(true);
    };

    const handleSaveClient = async () => {
        try {
            if (!currentClient.name || !currentClient.email || !currentClient.phone) {
                alert('Все поля обязательны для заполнения');
                return;
            }

            if (isEditMode && currentClient.id) {
                await clientApi.updateClient(currentClient.id, currentClient);
            } else {
                await handleAddClient(); // Используем исправленную функцию
            }

            setIsModalVisible(false);
            resetModal();
            fetchClients();
        } catch (error) {
            console.error('Ошибка при сохранении клиента', error);
        }
    };

    const handleAddClient = async () => {
        try {
            if (currentClient.name && currentClient.email && currentClient.phone) {
                await clientApi.createClient(currentClient);
                setIsModalVisible(false);
                resetModal();
                fetchClients();
            } else {
                alert('Все поля обязательны для заполнения');
            }
        } catch (error) {
            console.error('Ошибка при добавлении клиента', error);
        }
    };

    const resetModal = () => {
        setIsEditMode(false);
        setCurrentClient({ name: '', email: '', phone: '' });
    };

    const renderClientItem = ({ item }: { item: Client }) => (
        <TouchableOpacity
            style={styles.clientCard}
            onPress={() => handleCardPress(item)}
            onLongPress={() => handleLongPress(item.id)}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={['#4A90E2', '#007AFF']}
                style={styles.clientIcon}
            >
                <Icon name="account" size={24} color="white" />
            </LinearGradient>

            <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{item.name}</Text>
                <View style={styles.contactContainer}>
                    <Icon name="email" size={14} color="#868e96" />
                    <Text style={styles.clientEmail}>{item.email}</Text>
                </View>
                <View style={styles.contactContainer}>
                    <Icon name="phone" size={14} color="#868e96" />
                    <Text style={styles.clientPhone}>{item.phone}</Text>
                </View>
            </View>

            {isDeleteMode && (
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.deleteButton}
                >
                    <Icon name="trash-can-outline" size={24} color="#ff3b30" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    const renderModal = () => (
        <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => {
                setIsModalVisible(false);
                resetModal();
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {isEditMode ? 'Редактировать клиента' : 'Новый клиент'}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Имя"
                        placeholderTextColor="#868e96"
                        value={currentClient.name}
                        onChangeText={(text) =>
                            setCurrentClient(prev => ({ ...prev, name: text }))
                        }
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#868e96"
                        value={currentClient.email} // Используем currentClient вместо newClient
                        keyboardType="email-address"
                        onChangeText={(text) =>
                            setCurrentClient(prev => ({ ...prev, email: text }))
                        }
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Телефон"
                        placeholderTextColor="#868e96"
                        value={currentClient.phone} // Используем currentClient вместо newClient
                        keyboardType="phone-pad"
                        onChangeText={(text) =>
                            setCurrentClient(prev => ({ ...prev, phone: text }))
                        }
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => {
                                setIsModalVisible(false);
                                resetModal();
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Отмена</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.submitButton]}
                            onPress={handleSaveClient}
                        >
                            <Text style={styles.submitButtonText}>
                                {isEditMode ? 'Сохранить' : 'Добавить'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
    const handleDelClient = async (id: number) => {
        try {
            await clientApi.deleteClient(id);
            fetchClients();
        }catch (error) {
            console.error('Ошибка при удалении клиента', error);
        }
    }
    const handleDelete = (id: number) => {
        handleDelClient(id);
        setIsDeleteMode(false);
    };

    const handleLongPress = (id: number) => {
        setIsDeleteMode(true);
        setSelectedClientId(id);
    };

    const cancelDeleteMode = () => {
        setIsDeleteMode(false);
        setSelectedClientId(null);
    };

    const fetchClients = async () => {
        try {
            const { data } = await clientApi.getClients();
            setClients(data)
        } catch (error) {
            console.error('Ошибка при загрузке клиентов', error);
        }
    };


    useEffect(() => {
        fetchClients();
    }, []);



    return (
        <View style={styles.container}>
            {/* Хедер */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="chevron-left" size={28} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Клиенты</Text>
                <View style={{ width: 28 }} /> {/* Для выравнивания */}
            </View>
            {renderHeaderControls()}
            {/* Список клиентов */}
            <FlatList
                data={filteredAndSortedClients}
                keyExtractor={(item) => item.id}
                renderItem={renderClientItem}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="account-group" size={48} color="#868e96" />
                        <Text style={styles.emptyText}>Нет клиентов</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />

            {isDeleteMode && (
                <TouchableOpacity
                    style={styles.cancelDeleteButton}
                    onPress={cancelDeleteMode}
                >
                    <Text style={styles.cancelDeleteText}>Отменить</Text>
                </TouchableOpacity>
            )}

            {/* Кнопка Добавить клиента */}
            {!isDeleteMode && <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsModalVisible(true)}
            >
                <LinearGradient
                    colors={['#007AFF', '#0040FF']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Icon name="plus" size={24} color="white" />
                    <Text style={styles.addButtonText}>Новый клиент</Text>
                </LinearGradient>
            </TouchableOpacity>}

            {/* Модальное окно для добавления клиента */}
            {renderModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    controlsContainer: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e5e5e5',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f7',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 17,
        color: '#1c1c1e',
        paddingVertical: 0,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sortButton: {
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    sortGradient: {
        width: 40,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        overflow: 'hidden',
    },
    sortPicker: {
        borderWidth: 1,
        borderRadius: 8,
        height: 32,
        backgroundColor: '#f5f5f7',
    },
    pickerItem: {

        fontSize: 15,
        color: '#1c1c1e',
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e5e5e5',
    },
    backButton: {
        padding: 8,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1c1c1e',
    },
    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    clientIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 17,
        fontWeight: '500',
        color: '#1c1c1e',
        marginBottom: 4,
    },
    contactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    clientEmail: {
        fontSize: 15,
        color: '#868e96',
        marginLeft: 8,
    },
    clientPhone: {
        fontSize: 15,
        color: '#868e96',
        marginLeft: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 17,
        color: '#868e96',
        marginTop: 16,
    },
    addButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1c1c1e',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1c1c1e',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        marginRight: 8,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        marginLeft: 8,
    },
    cancelButtonText: {
        color: '#1c1c1e',
        fontWeight: '600',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 12,
    },
    cancelDeleteButton: {
        backgroundColor: '#ff3b30',
        borderRadius: 12,
        padding: 14,
        margin: 16,
        alignItems: 'center',
    },
    cancelDeleteText: {
        color: 'white',
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 100,
    },
});

export default Clients;