import React, {useEffect, useMemo, useState} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    Vibration, Platform, KeyboardAvoidingView, Picker,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { clientApi } from "@/api/clientApi";
import { noteApi } from "@/api/noteApi";
import { Note, Client } from "@/api/models";
import {LinearGradient} from "expo-linear-gradient";

const Notes: React.FC = () => {
    const navigation = useNavigation();
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newNote, setNewNote] = useState<string>("");
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'content' | 'clientId' | 'date'>('date');
    const [sortAsc, setSortAsc] = useState(false);

    // Фильтрация и сортировка
    const filteredAndSortedNotes = useMemo(() => {
        let result = [...notes];

        // Поиск
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(note =>
                note.content.toLowerCase().includes(lowerQuery)
            );
        }

        // Сортировка
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const aDate = new Date(a.createdAt).getTime();
                const bDate = new Date(b.createdAt).getTime();
                return sortAsc ? aDate - bDate : bDate - aDate;
            }

            const aValue = a[sortBy].toString().toLowerCase();
            const bValue = b[sortBy].toString().toLowerCase();

            return sortAsc
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

        return result;
    }, [notes, searchQuery, sortBy, sortAsc]);

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
                    placeholder="Поиск заметок..."
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
                        colors={['#32CD32', '#228B22']}
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
                        dropdownIconColor="#32CD32"
                        style={styles.sortPicker}
                        onValueChange={(value) => setSortBy(value)}
                    >
                        <Picker.Item
                            label="Сортировка по дате"
                            value="date"
                            style={styles.pickerItem}
                        />
                        <Picker.Item
                            label="Сортировка по содержимому"
                            value="content"
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

    // Удаление заметки
    const handleDeleteNote = async (noteId: number) => {
        try {
            await noteApi.deleteNotes(noteId);
            setNotes(notes.filter(note => note.id !== noteId));
            setIsDeleteMode(false);
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // Обработчик долгого нажатия
    const handleLongPress = (noteId: number) => {
        Vibration.vibrate(50);
        setIsDeleteMode(true);
        setSelectedNoteId(noteId);
    };

    // Отмена режима удаления
    const cancelDeleteMode = () => {
        setIsDeleteMode(false);
        setSelectedNoteId(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="chevron-left" size={28} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    {selectedClientId ? 'Заметки' : 'Выберите клиента'}
                </Text>
                <View style={{ width: 28 }} />
            </View>

            {selectedClientId && renderHeaderControls()}

            {!selectedClientId ? (
                <FlatList
                    data={clients}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.clientCard}
                            onPress={() => setSelectedClientId(item.id)}
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
                    <FlatList
                        data={filteredAndSortedNotes}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.noteCard}
                                onLongPress={() => handleLongPress(item.id)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['#32CD32', '#228B22']}
                                    style={styles.noteIcon}
                                >
                                    <Icon name="text" size={20} color="white" />
                                </LinearGradient>

                                <View style={styles.noteContent}>
                                    <Text style={styles.noteText}>{item.content}</Text>
                                </View>

                                {isDeleteMode && (
                                    <TouchableOpacity
                                        onPress={() => handleDeleteNote(item.id)}
                                        style={styles.deleteButton}
                                    >
                                        <Icon name="trash-can-outline" size={24} color="#ff3b30" />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Icon name="note-text" size={48} color="#868e96" />
                                <Text style={styles.emptyText}>Нет заметок</Text>
                            </View>
                        }
                    />

                    {isDeleteMode && (
                        <TouchableOpacity
                            style={styles.cancelDeleteButton}
                            onPress={cancelDeleteMode}
                        >
                            <Text style={styles.cancelDeleteText}>Отменить</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <LinearGradient
                            colors={['#32CD32', '#228B22']}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Icon name="plus" size={24} color="white" />
                            <Text style={styles.addButtonText}>Новая заметка</Text>
                        </LinearGradient>
                    </TouchableOpacity>

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
                                <Text style={styles.modalTitle}>Новая заметка</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Напишите что-нибудь..."
                                    placeholderTextColor="#868e96"
                                    multiline
                                    value={newNote}
                                    onChangeText={setNewNote}
                                    textAlignVertical="top"
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Отмена</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.submitButton]}
                                        onPress={handleCreateNote}
                                    >
                                        <Text style={styles.submitButtonText}>Сохранить</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Modal>
                </>
            )}
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
        shadowColor: '#32CD32',
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
    clientEmail: {
        fontSize: 15,
        color: '#868e96',
    },
    noteCard: {
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
    noteIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    noteContent: {
        flex: 1,
    },
    noteText: {
        fontSize: 16,
        color: '#1c1c1e',
        lineHeight: 22,
    },
    addButton: {
        margin: 16,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#32CD32',
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
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1c1c1e',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        minHeight: 120,
        textAlignVertical: 'top',
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
        backgroundColor: '#32CD32',
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

export default Notes;