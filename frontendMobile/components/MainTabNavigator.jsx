// components/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthContext } from '../context/AuthContext';
import ScannerScreen from '../pages/ScannerScreen';
import GeneratePassScreen from '../pages/GeneratePassScreen';
import ProfileScreen from '../pages/ProfileScreen';

const Tab = createBottomTabNavigator();

// Mismo criterio que el Layout web: filtra por módulos del backend,
// con fallback retrocompatible por rol.
// `strictRoleOnly: true` ignora el array de módulos y exige el rol exacto
// (usado para Scanner, que sólo debe verlo Guardia).
// `alwaysVisible: true` se salta todo filtro — se muestra a cualquier
// usuario autenticado sin importar módulos ni rol (Perfil/Logout).
const NAV_ITEMS = [
    {
        name: 'GeneratePass',
        label: 'Control QR',
        component: GeneratePassScreen,
        icon: 'qrcode',
        iconFamily: 'community',
        modulo: 'Control QR',
        roles: ['Directiva', 'Residente', 'Guardia', 'Admin', 'Presidenta'],
    },
    {
        name: 'Scanner',
        label: 'Escáner',
        component: ScannerScreen,
        icon: 'qrcode-scan',
        iconFamily: 'community',
        modulo: 'Control QR',
        roles: ['Guardia'],
        strictRoleOnly: true,
    },
    {
        name: 'Profile',
        label: 'Perfil',
        component: ProfileScreen,
        icon: 'account-circle',
        iconFamily: 'material',
        alwaysVisible: true,
    },
];

const getVisibleItems = (user) => {
    const userRole = typeof user?.rol === 'object' ? user?.rol?.nombre : user?.rol;

    return NAV_ITEMS.filter((item) => {
        if (item.alwaysVisible) return true;

        if (item.strictRoleOnly) {
            return item.roles.some(
                (r) => typeof r === 'string' && r.toLowerCase() === userRole?.toLowerCase()
            );
        }

        if (Array.isArray(user?.modulos) && user.modulos.length > 0) {
            return user.modulos.some(
                (m) =>
                    typeof m === 'string' &&
                    (m.toLowerCase() === item.modulo.toLowerCase() ||
                        m.toLowerCase() === (item.label || item.name).toLowerCase())
            );
        }

        return item.roles.some(
            (r) => typeof r === 'string' && r.toLowerCase() === userRole?.toLowerCase()
        );
    });
};

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
                        tabBarIcon: ({ color, size }) => {
                            const IconComponent =
                                item.iconFamily === 'community' ? MaterialCommunityIcons : MaterialIcons;
                            return <IconComponent name={item.icon} size={size} color={color} />;
                        },
                    }}
                />
            ))}
        </Tab.Navigator>
    );
};

export default MainTabNavigator;