// pages/ProfileScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
    const { user, logout } = useAuthContext();

    const userRole = typeof user?.rol === 'object' ? user?.rol?.nombre : user?.rol;

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar Sesión', style: 'destructive', onPress: () => logout() },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={{ padding: 16 }}>
                <Text style={styles.pageTitle}>Mi Perfil</Text>

                <View style={styles.card}>
                    <View style={styles.avatarWrap}>
                        <MaterialIcons name="account-circle" size={72} color="#f97316" />
                    </View>
                    <Text style={styles.name}>
                        {user?.nombre} {user?.apellido}
                    </Text>
                    {userRole ? <Text style={styles.role}>{userRole}</Text> : null}
                    {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={18} color="#fff" />
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f9fb' },
    pageTitle: { fontSize: 20, fontWeight: '700', color: '#191c1e', marginBottom: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e3e5',
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrap: { marginBottom: 12 },
    name: { fontSize: 17, fontWeight: '700', color: '#191c1e' },
    role: {
        fontSize: 12,
        fontWeight: '600',
        color: '#f97316',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    email: { fontSize: 13, color: '#6b7280', marginTop: 6 },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#dc2626',
        borderRadius: 8,
        paddingVertical: 12,
    },
    logoutButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default ProfileScreen;