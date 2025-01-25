import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";  // Импортируем useNavigation
import { Order, Client } from "@/api/models";
import { orderApi } from "@/api/orderApi";
import { clientApi } from "@/api/clientApi";

const OrderHistory: React.FC = () => {
    const navigation = useNavigation(); // Используем для навигации
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newOrder, setNewOrder] = useState<Omit<Order, "id">>({
        clientId: "",
        orderDetails: "",
        totalAmount: 0,
    });

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

    // Получение заказов для выбранного клиента
    useEffect(() => {
        if (!selectedClientId) return;
        const fetchOrders = async () => {
            try {
                const response = await orderApi.getOrders(selectedClientId);
                setOrders(await response.data);
                setNewOrder((prev) => ({ ...prev, clientId: selectedClientId }));
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };
        fetchOrders();
    }, [selectedClientId]);

    // Создание нового заказа
    const handleCreateOrder = async () => {
        try {
            const response = await orderApi.createOrder(newOrder);
            setOrders((prevOrders) => [...prevOrders, response.data]);
            setModalVisible(false);
            setNewOrder({ clientId: selectedClientId!, orderDetails: "", totalAmount: 0 });
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    return (
        <View style={styles.container}>
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
                                <Text style={styles.clientText}>Client: {item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </>
            ) : (
                <>
                    <Text style={styles.header}>Order History for {selectedClientId}</Text>

                    {/* Кнопка создания заказа */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Icon name="plus" size={24} color="#fff" />
                        <Text style={styles.addButtonText}>Create Order</Text>
                    </TouchableOpacity>

                    {/* Список заказов */}
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.orderItem}>
                                <Text style={styles.orderDate}>
                                    Date: {new Date(item.createdAt).toLocaleDateString()}
                                </Text>
                                <Text style={styles.orderAmount}>
                                    Amount: ${item.totalAmount.toFixed(2)}
                                </Text>
                                <Text style={styles.orderDetails}>
                                    Details: {item.orderDetails}
                                </Text>
                            </View>
                        )}
                    />

                    {/* Модальное окно для создания заказа */}
                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalHeader}>Create New Order</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Order Details"
                                    value={newOrder.orderDetails}
                                    onChangeText={(text) =>
                                        setNewOrder({ ...newOrder, orderDetails: text })
                                    }
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Total Amount"
                                    keyboardType="numeric"
                                    value={newOrder.totalAmount.toString()}
                                    onChangeText={(text) =>
                                        setNewOrder({
                                            ...newOrder,
                                            totalAmount: parseFloat(text) || 0,
                                        })
                                    }
                                />

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={handleCreateOrder}
                                    >
                                        <Text style={styles.modalButtonText}>Create</Text>
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

export default OrderHistory;

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
    clientText: {
        fontSize: 18,
        color: "#333",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007aff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 8,
    },
    orderItem: {
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    orderDate: {
        fontSize: 16,
        marginBottom: 4,
        color: "#333",
    },
    orderAmount: {
        fontSize: 16,
        marginBottom: 4,
        color: "#007aff",
    },
    orderDetails: {
        fontSize: 14,
        color: "#666",
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
