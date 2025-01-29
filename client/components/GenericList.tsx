import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ListRenderItem,
    Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type GenericListProps<T, K> = {
    data: T[];
    keyExtractor: (item: T) => string;
    renderItem: ListRenderItem<T>;
    headerTitle: string;
    emptyMessage: string;
    selectedId: string | null;
    clients?: K[];
    onSelectClient?: (id: string) => void;
    onAddItem?: () => void;
    onDeleteItem?: (id: string) => void;
    addButtonText?: string;
    isDeleteMode?: boolean;
    onCancelDelete?: () => void;
    styles?: {
        container?: object;
        header?: object;
        item?: object;
        content?: object;
        addButton?: object;
        addButtonText?: object;
    };
};

const GenericList = <T extends { id: string }, K extends { id: string; name: string; email?: string }>({
    data,
    keyExtractor,
    renderItem,
    onCancelDelete,
    headerTitle,
    emptyMessage,
    selectedId,
    clients,
    onSelectClient,
    onAddItem,
    onDeleteItem,
    addButtonText = 'Добавить',
    styles: customStyles = {},
    }: GenericListProps<T, K>) => {
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const handleLongPress = (id: string) => {
        Vibration.vibrate(50);
        setIsDeleteMode(true);
        setSelectedItemId(id);
    };

    const handleDelete = (id: string) => {
        onDeleteItem?.(id);
        setIsDeleteMode(false);
    };

    const cancelDeleteMode = () => {
        setIsDeleteMode(false);
        setSelectedItemId(null);
        onCancelDelete?.();
    };

    const renderClientItem = ({ item }: { item: K }) => (
        <TouchableOpacity
            style={[styles.item, customStyles.item]}
            onPress={() => onSelectClient?.(item.id)}
        >
            <Text style={[styles.content, customStyles.content]}>{item.name}</Text>
            {item.email && <Text style={styles.subText}>{item.email}</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, customStyles.container]}>
            <Text style={[styles.header, customStyles.header]}>{headerTitle}</Text>

            {!selectedId && clients ? (
                <FlatList
                    data={clients}
                    keyExtractor={(item) => item.id}
                    renderItem={renderClientItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
                />
            ) : (
                <>
                    <FlatList
                        data={data}
                        keyExtractor={keyExtractor}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.item, customStyles.item]}
                                onLongPress={() => handleLongPress(item.id)}
                                activeOpacity={0.7}
                            >
                                {renderItem({ item, index: 0, separators: { highlight: () => {}, unhighlight: () => {}, updateProps: () => {} } })}
                                {isDeleteMode && (
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        style={styles.deleteIcon}
                                    >
                                        <Icon name="minus-circle" size={28} color="red" />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
                    />

                    {onAddItem && (
                        <TouchableOpacity
                            style={[styles.addButton, customStyles.addButton]}
                            onPress={onAddItem}
                        >
                            <Icon name="plus" size={24} color="#fff" />
                            <Text style={[styles.addButtonText, customStyles.addButtonText]}>
                                {addButtonText}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isDeleteMode && (
                        <TouchableOpacity
                            style={styles.cancelDeleteButton}
                            onPress={cancelDeleteMode}
                        >
                            <Text style={styles.cancelDeleteText}>Отменить удаление</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    item: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    subText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007aff',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
    deleteIcon: {
        marginLeft: 10,
        padding: 8,
    },
    cancelDeleteButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#ff4444',
        padding: 12,
        borderRadius: 8,
        elevation: 3,
    },
    cancelDeleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        fontSize: 16,
    },
});

export default GenericList;