import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, Picker, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Interaction, Client } from "@/api/models";
import { interactionApi } from "@/api/interactionApi";
import { clientApi } from "@/api/clientApi";
import { useNavigation } from '@react-navigation/native';
const Interactions: React.FC = () => {
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newInteraction, setNewInteraction] = useState<Omit<Interaction, 'id'>>({
        clientId: '',
        type: '',
        notes: '',
        date: new Date(),
    });
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const navigation = useNavigation();
    // Загрузка списка взаимодействий
    useEffect(() => {
        const fetchInteractions = async () => {
            try {
                const response = await interactionApi.getInteractions('');
                setInteractions(await response.data);
            } catch (error) {
                console.error('Error fetching interactions:', error);
            }
        };
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
        try {
            const response = await interactionApi.createInteraction(newInteraction);
            setInteractions([...interactions, await response.data]);
            setModalVisible(false);
            setNewInteraction({ clientId: '', type: '', notes: '', date: new Date() });
        } catch (error) {
            console.error('Error adding interaction:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Стрелка назад */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={28} color="#007AFF" />
            </TouchableOpacity>

            <Text style={styles.header}>Взаимодействия</Text>

            {/* Кнопка добавления */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="plus" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Добавить взаимодействие</Text>
            </TouchableOpacity>

            {/* Список взаимодействий */}
            <FlatList
                data={interactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.interactionItem}>
                        <Text style={styles.clientName}>Клиент ID: {item.clientId}</Text>
                        <Text style={styles.type}>Тип: {item.type}</Text>
                        <Text style={styles.notes}>Заметки: {item.notes}</Text>
                        <Text style={styles.date}>Дата: {new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                )}
            />

            {/* Модальное окно */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Новое взаимодействие</Text>

                        {/* Выпадающий список клиентов */}
                        <Picker
                            selectedValue={newInteraction.clientId}
                            style={styles.picker}
                            onValueChange={(value) => setNewInteraction({ ...newInteraction, clientId: value })}
                        >
                            <Picker.Item label="Выберите клиента" value="" />
                            {clients.map((client) => (
                                <Picker.Item key={client.id} label={client.name} value={client.id} />
                            ))}
                        </Picker>

                        <TextInput
                            style={styles.input}
                            placeholder="Тип взаимодействия"
                            value={newInteraction.type}
                            onChangeText={(text) => setNewInteraction({ ...newInteraction, type: text })}
                        />
                        <TextInput
                            style={[styles.input, { height: 100 }]}
                            placeholder="Заметки"
                            multiline={true}
                            value={newInteraction.notes}
                            onChangeText={(text) => setNewInteraction({ ...newInteraction, notes: text })}
                        />

                        {/* Выбор даты */}
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setDatePickerVisible(true)}
                        >
                            <Text>
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

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleAddInteraction}
                            >
                                <Text style={styles.modalButtonText}>Добавить</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Interactions;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 16,
        zIndex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: "auto",
        marginBottom: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
    },
    interactionItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    type: {
        fontSize: 14,
        color: '#555',
    },
    notes: {
        fontSize: 14,
        color: '#777',
        marginTop: 5,
    },
    date: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
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
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 15,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
