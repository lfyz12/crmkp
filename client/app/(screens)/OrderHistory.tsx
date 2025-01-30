import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { Order, Client } from "@/api/models";
import { orderApi } from "@/api/orderApi";
import { clientApi } from "@/api/clientApi";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

const OrderHistory: React.FC = () => {
    const navigation = useNavigation();
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newOrder, setNewOrder] = useState<Omit<Order, "id">>({
        clientId: selectedClientId || 0, // Используем текущий selectedClientId
        orderDetails: "",
        totalAmount: 0,
    });
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "amount">("date");
    const [sortAsc, setSortAsc] = useState(true);

    useEffect(() => {
        setNewOrder(prev => ({
            ...prev,
            clientId: selectedClientId || 0
        }));
    }, [selectedClientId]);

    const filteredAndSortedOrders = useMemo(() => {
        let result = [...orders];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (order) =>
                    order.orderDetails.toLowerCase().includes(lowerQuery) ||
                    order.totalAmount.toString().includes(searchQuery)
            );
        }

        return result;
    }, [orders, searchQuery, sortBy, sortAsc]);

    const renderHeaderControls = () => (
        <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#868e96" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Поиск заказов..."
                    placeholderTextColor="#868e96"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const handleCardPress = (order: Order) => {
        if (isDeleteMode) return;
        setModalVisible(true);
        setNewOrder({
            clientId: order.clientId,
            orderDetails: order.orderDetails,
            totalAmount: order.totalAmount,
        });
    };

    const handleLongPress = (id: number) => {
        setIsDeleteMode(true);
        setSelectedOrderId(id);
    };

    const handleDelete = async (id: number) => {
        try {
            await orderApi.deleteOrders(id);
            fetchOrders();
        } catch (error) {
            console.error("Ошибка при удалении заказа", error);
        }
        setIsDeleteMode(false);
    };

    const cancelDeleteMode = () => {
        setIsDeleteMode(false);
        setSelectedOrderId(null);
    };

    const fetchClients = async () => {
        try {
            const response = await clientApi.getClients();
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchOrders = async () => {
        if (!selectedClientId) return;
        try {
            const response = await orderApi.getOrders(selectedClientId);
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const handleCreateOrder = async () => {
        try {
            // Проверка наличия clientId
            if (!newOrder.clientId || newOrder.clientId === 0) {
                alert("Ошибка: Клиент не выбран");
                return;
            }

            // Проверка заполнения обязательных полей
            if (!newOrder.orderDetails.trim() || newOrder.totalAmount <= 0) {
                alert("Заполните все обязательные поля (Детали и Сумма)");
                return;
            }

            await orderApi.createOrder(newOrder);
            fetchOrders();
            setModalVisible(false);
            setNewOrder({
                clientId: selectedClientId!,
                orderDetails: "",
                totalAmount: 0
            });
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Ошибка при создании заказа");
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClientId) fetchOrders();
    }, [selectedClientId]);

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleCardPress(item)}
            onLongPress={() => handleLongPress(item.id)}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={["#9370DB", "#6A5ACD"]}
                style={styles.orderIcon}
            >
                <Icon name="cart" size={24} color="white" />
            </LinearGradient>

            <View style={styles.orderInfo}>
                <Text style={styles.orderDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.detailContainer}>
                    <Icon name="currency-usd" size={14} color="#868e96" />
                    <Text style={styles.orderAmount}>{item.totalAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.detailContainer}>
                    <Icon name="text" size={14} color="#868e96" />
                    <Text style={styles.orderDetails} numberOfLines={1}>
                        {item.orderDetails}
                    </Text>
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
    const handleOpenModal = () => {
        if (!selectedClientId) {
            alert("Сначала выберите клиента");
            return;
        }
        setModalVisible(true);
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="chevron-left" size={28} color="#6A5ACD" />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    {selectedClientId
                        ? `Заказы ${clients.find((c) => c.id === selectedClientId)?.name}`
                        : "Клиенты"}
                </Text>
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
                            onPress={() => setSelectedClientId(item.id)}
                        >
                            <LinearGradient
                                colors={["#4A90E2", "#007AFF"]}
                                style={styles.clientIcon}
                            >
                                <Icon name="account" size={20} color="white" />
                            </LinearGradient>
                            <View style={styles.clientInfo}>
                                <Text style={styles.clientName}>{item.name}</Text>
                                <View style={styles.contactContainer}>
                                    <Icon name="email" size={14} color="#868e96" />
                                    <Text style={styles.clientEmail}>{item.email}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <>
                    {renderHeaderControls()}
                    <FlatList
                        data={filteredAndSortedOrders}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderOrderItem}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Icon name="cart-remove" size={48} color="#868e96" />
                                <Text style={styles.emptyText}>Нет заказов</Text>
                            </View>
                        }
                    />
                </>
            )}

            {isDeleteMode && (
                <TouchableOpacity
                    style={styles.cancelDeleteButton}
                    onPress={cancelDeleteMode}
                >
                    <Text style={styles.cancelDeleteText}>Отменить</Text>
                </TouchableOpacity>
            )}

            {selectedClientId && !isDeleteMode && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleOpenModal}
                >
                    <LinearGradient
                        colors={["#9370DB", "#6A5ACD"]}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Icon name="plus" size={24} color="white" />
                        <Text style={styles.addButtonText}>Новый заказ</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Новый заказ</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Детали заказа"
                            placeholderTextColor="#868e96"
                            multiline
                            value={newOrder.orderDetails}
                            onChangeText={(text) =>
                                setNewOrder({ ...newOrder, orderDetails: text })
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Сумма"
                            placeholderTextColor="#868e96"
                            keyboardType="numeric"
                            value={newOrder.totalAmount.toString()}
                            onChangeText={(text) =>
                                setNewOrder({
                                    ...newOrder,
                                    totalAmount: parseFloat(text) || 0,
                                })
                            }
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
                                onPress={handleCreateOrder}
                            >
                                <Text style={styles.submitButtonText}>Создать</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    // Все стили из компонента Clients
    ...StyleSheet.create({
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
            shadowColor: '#6A5ACD',
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
        orderCard: {
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
        orderIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        orderInfo: {
            flex: 1,
        },
        orderDate: {
            fontSize: 15,
            color: '#868e96',
            marginBottom: 4,
        },
        detailContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        orderAmount: {
            fontSize: 16,
            color: '#6A5ACD',
            marginLeft: 8,
        },
        orderDetails: {
            fontSize: 15,
            color: '#1c1c1e',
            marginLeft: 8,
            flexShrink: 1,
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
            shadowColor: '#6A5ACD',
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
            backgroundColor: '#6A5ACD',
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
    }),
});

export default OrderHistory;