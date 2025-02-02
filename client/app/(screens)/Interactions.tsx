import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    TextInput,
    Picker,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Interaction, Client } from "@/api/models";
import { interactionApi } from "@/api/interactionApi";
import { clientApi } from "@/api/clientApi";
import { useNavigation } from '@react-navigation/native';
import {LinearGradient} from "expo-linear-gradient";

const Interactions: React.FC = () => {
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newInteraction, setNewInteraction] = useState<Omit<Interaction, 'id'>>({
        clientId: 0,
        type: '',
        notes: '',
        date: new Date(),
    });
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const navigation = useNavigation();
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedInteractionId, setSelectedInteractionId] = useState<number | null>(null);
    // Добавляем состояния
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'type' | 'clientId'>('date');
    const [sortAsc, setSortAsc] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    // Фильтрация и сортировка
    const filteredAndSortedInteractions = useMemo(() => {
        let result = [...interactions];

        // Поиск
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(interaction =>
                interaction.type.toLowerCase().includes(lowerQuery) ||
                interaction.notes.toLowerCase().includes(lowerQuery) ||
                interaction.clientId.toString().includes(lowerQuery)
            );
        }

        // Сортировка
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const aTime = a.date.getTime();
                const bTime = b.date.getTime();
                return sortAsc ? aTime - bTime : bTime - aTime;
            }

            const aValue = a[sortBy].toString().toLowerCase();
            const bValue = b[sortBy].toString().toLowerCase();

            return sortAsc
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

        return result;
    }, [interactions, searchQuery, sortBy, sortAsc]);

    // Элементы управления
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
                    placeholder="Поиск взаимодействий..."
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
                        colors={['#FF6B6B', '#FF4500']}
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
                        dropdownIconColor="#FF6B6B"
                        style={styles.sortPicker}
                        onValueChange={(value) => setSortBy(value)}
                    >
                        <Picker.Item
                            label="Сортировка по дате"
                            value="date"
                            style={styles.pickerItem}
                        />
                        <Picker.Item
                            label="Сортировка по типу"
                            value="type"
                            style={styles.pickerItem}
                        />
                        <Picker.Item
                            label="Сортировка по клиенту"
                            value="clientId"
                            style={styles.pickerItem}
                        />
                    </Picker>
                </View>
            </View>
        </View>
    );

    const fetchInteractions = async (clientId: number) => {
        try {
            const response = await interactionApi.getInteractions(clientId);
            const data = response.data;

            const formattedData = data.map((interaction: Interaction) => ({
                ...interaction,
                date: new Date(interaction.date)
            }));

            setInteractions(formattedData);
        } catch (error) {
            console.error('Error fetching interactions:', error);
            alert('Ошибка при загрузке взаимодействий');
        }
    };

    const handleDelClient = async (id: number) => {
        try {
            await interactionApi.deleteInteractions(id);
            fetchInteractions();
        }catch (error) {
            console.error('Ошибка при удалении клиента', error);
        }
    }
    const handleDelete = async (id: number) => {
        try {
            await interactionApi.deleteInteractions(id);
            if (selectedClientId) {
                await fetchInteractions(selectedClientId);
            }
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Ошибка при удалении взаимодействия');
        }
        setIsDeleteMode(false);
    };

    const handleLongPress = (id: number) => {
        setIsDeleteMode(true);
        setSelectedInteractionId(id);
    };

    const cancelDeleteMode = () => {
        setIsDeleteMode(false);
        setSelectedInteractionId(null);
    };
    // Загрузка списка взаимодействий
    useEffect(() => {
        fetchInteractions();
    }, []);

    // Загрузка списка клиентов
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await clientApi.getClients();
                setClients(response.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };
        fetchClients();
    }, []);

    // Добавление нового взаимодействия
    const handleAddInteraction = async () => {
        if (!selectedClientId) {
            alert('Сначала выберите клиента');
            return;
        }

        try {
            const payload = {
                ...newInteraction,
                clientId: selectedClientId, // Используем выбранный clientId
                date: newInteraction.date.toISOString()
            };

            const response = await interactionApi.createInteraction(payload);
            setInteractions([...interactions, {
                ...response.data,
                date: new Date(response.data.date) // Конвертируем обратно в Date
            }]);

            setModalVisible(false);
            setNewInteraction({
                clientId: 0,
                type: '',
                notes: '',
                date: new Date()
            });
        } catch (error) {
            console.error('Error adding interaction:', error);
        }
    };


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedClientId(null)
                        navigation.goBack()
                    }}
                    style={styles.backButton}
                >
                    <Icon name="chevron-left" size={28} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Взаимодействия</Text>
                <View style={{ width: 28 }} />
            </View>
            {!selectedClientId ? (
                <FlatList
                    data={clients}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.clientCard}
                            onPress={() => {
                                setSelectedClientId(item.id);
                                fetchInteractions(item.id);
                            }}
                        >
                            <LinearGradient
                                colors={['#4A90E2', '#007AFF']}
                                style={styles.clientIcon}
                            >
                                <Icon name="account" size={20} color="white" />
                            </LinearGradient>
                            <View style={styles.clientInfo}>
                                <Text style={styles.clientName}>{item.name}</Text>
                                <Text style={styles.clientEmail}>{item.email}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <>
                {/* Добавляем кнопку возврата к выбору клиента */}
                <TouchableOpacity
                    style={styles.backToClients}
                    onPress={() => setSelectedClientId(null)}
                >
                    <Icon name="arrow-left" size={20} color="#007AFF" />
                    <Text style={styles.backToClientsText}>Выбрать другого клиента</Text>
                </TouchableOpacity>
                    {renderHeaderControls()}
                    <FlatList
                        data={filteredAndSortedInteractions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.interactionCard}
                                onLongPress={() => handleLongPress(item.id)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['#FF6B6B', '#FF4500']}
                                    style={styles.typeIcon}
                                >
                                    <Icon
                                        name={getInteractionIcon(item.type)}
                                        size={20}
                                        color="white"
                                    />
                                </LinearGradient>

                                <View style={styles.interactionInfo}>
                                    <Text style={styles.clientName}>Клиент #{item.clientId}</Text>
                                    <View style={styles.detailRow}>
                                        <Icon name="calendar" size={14} color="#868e96" />
                                        <Text style={styles.date}>
                                            {new Date(item.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text
                                        style={styles.notes}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {item.notes}
                                    </Text>
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
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Icon name="comment-text-outline" size={48} color="#868e96" />
                                <Text style={styles.emptyText}>Нет взаимодействий</Text>
                            </View>
                        }
                        contentContainerStyle={styles.listContent}
                    />
                </>
            )}
            {/* Add Button */}
            {selectedClientId && <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <LinearGradient
                    colors={['#FF6B6B', '#FF4500']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Icon name="plus" size={24} color="white" />
                    <Text style={styles.addButtonText}>Новое взаимодействие</Text>
                </LinearGradient>
            </TouchableOpacity>}

            {/* Delete Mode Footer */}
            {isDeleteMode && (
                <TouchableOpacity
                    style={styles.cancelDeleteButton}
                    onPress={cancelDeleteMode}
                >
                    <Text style={styles.cancelDeleteText}>Отменить</Text>
                </TouchableOpacity>
            )}

            {/* Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Новое взаимодействие
                        </Text>

                        <Text style={styles.selectedClientInfo}>
                            Клиент: {clients.find(c => c.id === selectedClientId)?.name}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Тип взаимодействия"
                            placeholderTextColor="#868e96"
                            value={newInteraction.type}
                            onChangeText={(text) =>
                                setNewInteraction({ ...newInteraction, type: text })
                            }
                        />

                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            placeholder="Заметки"
                            placeholderTextColor="#868e96"
                            multiline
                            value={newInteraction.notes}
                            onChangeText={(text) =>
                                setNewInteraction({ ...newInteraction, notes: text })
                            }
                        />

                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setDatePickerVisible(true)}
                        >
                            <Icon name="calendar" size={18} color="#868e96" />
                            <Text style={styles.dateText}>
                                {newInteraction.date
                                    ? newInteraction.date.toLocaleDateString()
                                    : 'Выберите дату'}
                            </Text>
                        </TouchableOpacity>

                        {isDatePickerVisible && (
                            <DateTimePicker
                                value={newInteraction.date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setDatePickerVisible(false);
                                    if (selectedDate) {
                                        setNewInteraction({ ...newInteraction, date: selectedDate });
                                    }
                                }}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleAddInteraction}
                            >
                                <Text style={styles.submitButtonText}>Сохранить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const getInteractionIcon = (type: string) => {
    switch(type.toLowerCase()) {
        case 'звонок': return 'phone';
        case 'встреча': return 'calendar';
        default: return 'email';
    }
};

const styles = StyleSheet.create({
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
    backToClients: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    backToClientsText: {
        color: '#007AFF',
        marginLeft: 8,
        fontSize: 16,
    },
    selectedClientInfo: {
        fontSize: 16,
        color: '#1c1c1e',
        marginBottom: 16,
        textAlign: 'center',
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
    clientEmail: {
        fontSize: 15,
        color: '#868e96',
    },
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
        shadowColor: '#FF6B6B',
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
        marginBottom: 5,
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
    addButton: {
        margin: 16,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#FF6B6B',
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
    interactionCard: {
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
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    interactionInfo: {
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    date: {
        fontSize: 15,
        color: '#868e96',
        marginLeft: 8,
    },
    notes: {
        fontSize: 15,
        color: '#868e96',
        lineHeight: 20,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 12,
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
    picker: {
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    pickerPlaceholder: {
        color: '#868e96',
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
    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    dateText: {
        fontSize: 16,
        color: '#1c1c1e',
        marginLeft: 8,
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
        backgroundColor: '#FF6B6B',
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
});

export default Interactions;