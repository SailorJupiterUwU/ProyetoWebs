import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({ correo: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error } = useAuth();

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async () => {
        const errors = {};
        if (!formData.correo) errors.correo = 'El correo es requerido';
        if (!formData.password) errors.password = 'La contraseña es requerida';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const result = await login(formData.correo, formData.password);
        if (result.success) {
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.brandContainer}>
                    <MaterialIcons name="domain" size={48} color="#f97316" />
                    <Text style={styles.brandName}>CondoSecure Manager</Text>
                    <Text style={styles.brandTagline}>
                        Sistema para Gestión Administrativa, Financiera y de Seguridad de un Conjunto
                        Habitacional
                    </Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.title}>Acceso al Sistema</Text>

                    {error ? (
                        <View style={styles.errorAlert}>
                            <Text style={styles.errorAlertText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.field}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <View style={[styles.inputWrapper, formErrors.correo && styles.inputWrapperError]}>
                            <MaterialIcons name="mail" size={18} color="#584237" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.correo}
                                onChangeText={(v) => handleChange('correo', v)}
                                placeholder="correo@ejemplo.com"
                                placeholderTextColor="#9ca3af"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {formErrors.correo ? <Text style={styles.errorText}>{formErrors.correo}</Text> : null}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={[styles.inputWrapper, formErrors.password && styles.inputWrapperError]}>
                            <MaterialIcons name="lock" size={18} color="#584237" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.password}
                                onChangeText={(v) => handleChange('password', v)}
                                placeholder="••••••••"
                                placeholderTextColor="#9ca3af"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                                <MaterialIcons
                                    name={showPassword ? 'visibility_off' : 'visibility'}
                                    size={18}
                                    color="#584237"
                                />
                            </TouchableOpacity>
                        </View>
                        {formErrors.password ? (
                            <Text style={styles.errorText}>{formErrors.password}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Iniciar Sesión</Text>
                                <MaterialIcons name="arrow_forward" size={18} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Solicitar Registro</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    brandContainer: { alignItems: 'center', marginBottom: 32 },
    brandName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#191c1e',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    brandTagline: {
        fontSize: 13,
        color: '#565e74',
        textAlign: 'center',
        lineHeight: 18,
    },
    formCard: { width: '100%' },
    title: { fontSize: 22, fontWeight: '700', color: '#191c1e', marginBottom: 20 },
    errorAlert: {
        padding: 12,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fee2e2',
        borderRadius: 8,
        marginBottom: 16,
    },
    errorAlertText: { color: '#b91c1c', fontSize: 13 },
    field: { marginBottom: 16 },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#584237',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7f9fb',
        borderWidth: 1,
        borderColor: '#e0e3e5',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputWrapperError: { borderColor: '#dc2626' },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#191c1e' },
    errorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },
    forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotPasswordText: { fontSize: 12, color: '#9d4300', fontWeight: '600' },
    submitButton: {
        backgroundColor: '#f97316',
        borderRadius: 8,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 14, marginRight: 6 },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: { fontSize: 13, color: '#6b7280' },
    registerLink: { fontSize: 13, color: '#9d4300', fontWeight: '700' },
});

export default LoginScreen;
