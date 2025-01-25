import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";  // Импортируем useNavigation
import { clientApi } from "@/api/clientApi";
import { noteApi } from "@/api/noteApi";
import { Note, Client } from "@/api/models";

const Notes: React.FC = () => {
    const navigation = useNavigation(); // Используем для навигации
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newNote, setNewNote] = useState<string>("");

    // Получение списка клиентов
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await clientApi.getClients();
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };
        fetchClients();
    }, []);

    // Получение заметок для выбранного клиента
    useEffect(() => {
        if (!selectedClientId) return;

        const fetchNotes = async () => {
            try {
                const response = await noteApi.getNotes(selectedClientId);
                setNotes(await response.data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };
        fetchNotes();
    }, [selectedClientId]);

    // Создание новой заметки
    const handleCreateNote = async () => {
        if (!newNote.trim() || !selectedClientId) return;

        try {
            const response = await noteApi.createNote({
                clientId: selectedClientId,
                content: newNote,
            });
            setNotes((prevNotes) => [...prevNotes, response.data]);
            setNewNote("");
            setModalVisible(false);
        } catch (error) {
            console.error("Error creating note:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Стрелка назад */}
            <TouchableOpacity
                style={styles.backButton}  // Стиль для кнопки назад
                onPress={() => navigation.goBack()} // Возврат назад
            >
                <Icon name="arrow-left" size={24} color="#007aff" />
            </TouchableOpacity>

            {!selectedClientId ? (
                <>
                    <Text style={styles.header}>Select a Client</Text>
                    <FlatList
                        data={clients}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.clientItem}
                                onPress={() => setSelectedClientId(item.id)}
                            >
                                <Text style={styles.clientName}>{item.name}</Text>
                                <Text style={styles.clientEmail}>{item.email}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </>
            ) : (
                <>
                    <Text style={styles.header}>Notes for Client</Text>

                    <FlatList
                        data={notes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.noteItem}>
                                <Text style={styles.noteContent}>{item.content}</Text>
                            </View>
                        )}
                    />

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Icon name="plus" size={24} color="#fff" />
                        <Text style={styles.addButtonText}>Add Note</Text>
                    </TouchableOpacity>

                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalHeader}>New Note</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter note content"
                                    value={newNote}
                                    onChangeText={setNewNote}
                                />
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={handleCreateNote}
                                    >
                                        <Text style={styles.modalButtonText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
};

export default Notes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 16,
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 16,
        zIndex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    clientItem: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    clientName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    clientEmail: {
        fontSize: 14,
        color: "#666",
    },
    noteItem: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    noteContent: {
        fontSize: 16,
        color: "#333",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007aff",
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalButton: {
        flex: 1,
        backgroundColor: "#007aff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 4,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: "#ff3b30",
    },
});
