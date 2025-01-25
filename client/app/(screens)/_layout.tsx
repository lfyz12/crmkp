import React from 'react';
import {Tabs} from "expo-router";
import {Platform} from "react-native";
import Interactions from "@/app/(screens)/Interactions";

export default function screensLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: { position: 'absolute' },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Главная',
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="Clients"
                options={{
                    title: 'Клиенты',
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="Interactions"
                options={{
                    title: 'Действия',
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="OrderHistory"
                options={{
                    title: 'История заказов',
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="Notes"
                options={{
                    title: 'Заметки',
                    tabBarStyle: { display: 'none' }
                }}
            />
        </Tabs>
    );
};

