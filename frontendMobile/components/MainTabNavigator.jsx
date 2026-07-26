import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { AuthProvider, useAuthContext } from '../context/AuthContext';
import LoginScreen from '../pages/LoginScreen';
import RegisterScreen from '../pages/RegisterScreen';
import ScannerScreen from '../pages/ScannerScreen';
import GeneratePassScreen from '../pages/GeneratePassScreen';

const Tab = createBottomTabNavigator();

// Mismo criterio que el Layout web: filtra por módulos del backend,
const NAV_ITEMS = [
    {
        name: 'GeneratePass',
        label: 'Control QR',
        component: GeneratePassScreen,
        icon: 'qr_code_2',
        modulo: 'Control QR',
        roles: ['Directiva', 'Residente', 'Guardia', 'Admin', 'Presidenta'],
    },
];

const getVisibleItems = (user) =>
    NAV_ITEMS.filter((item) => {
        if (Array.isArray(user?.modulos) && user.modulos.length > 0) {
            return user.modulos.some(
                (m) =>
                    typeof m === 'string' &&
                    (m.toLowerCase() === item.modulo.toLowerCase() ||
                        m.toLowerCase() === (item.label || item.name).toLowerCase())
            );
        }

        const userRole = typeof user?.rol === 'object' ? user?.rol?.nombre : user?.rol;
        return item.roles.some(
            (r) => typeof r === 'string' && r.toLowerCase() === userRole?.toLowerCase()
        );
    });

const MainTabNavigator = () => {
    const { user } = useAuthContext();
    const visibleItems = getVisibleItems(user);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#f97316',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    backgroundColor: '#101828',
                    borderTopColor: '#1f2937',
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
            }}
        >
            {visibleItems.map((item) => (
                <Tab.Screen
                    key={item.name}
                    name={item.name}
                    component={item.component}
                    options={{
                        tabBarLabel: item.label || item.name,
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name={item.icon} size={size} color={color} />
                        ),
                    }}
                />
            ))}
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
