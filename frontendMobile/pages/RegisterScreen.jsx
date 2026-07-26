import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useAuth from '../hooks/useAuth';
import { isValidPassword, isValidEmail, isValidCedula } from '../utils/validators';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        ci_ruc: '',
        casa: '',
        correo: '',
        password: '',
        confirmPassword: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [foto, setFoto] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const { registro, loading, error } = useAuth();

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            setFoto(result.assets[0]);
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.nombres) errors.nombres = 'Requerido';
        if (!formData.apellidos) errors.apellidos = 'Requerido';
        if (!isValidCedula(formData.ci_ruc)) errors.ci_ruc = 'CI/RUC inválido';
        if (!formData.casa) errors.casa = 'Requerido';
        if (!isValidEmail(formData.correo)) errors.correo = 'Correo inválido';
        if (!isValidPassword(formData.password)) {
            errors.password = 'Mínimo 8 caracteres, una mayúscula y un número';
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const result = await registro({
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            ci_ruc: formData.ci_ruc,
            numero_vivienda: formData.casa,
            correo_login: formData.correo,
            password: formData.password,
            foto: foto
                ? { uri: foto.uri, name: foto.fileName || 'foto.jpg', type: 'image/jpeg' }
                : undefined,
        });

        if (result.success) {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.successBlock}>
                        <MaterialIcons name="check_circle" size={56} color="#16a34a" />
                        <Text style={styles.title}>¡Solicitud Enviada!</Text>
                        <Text style={styles.subtitle}>
                            Tu solicitud fue enviada correctamente. La directiva revisará tu acceso y te
                            notificaremos por correo.
                        </Text>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.submitButtonText}>Ir al Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <MaterialIcons name="shield_person" size={40} color="#f97316" />
                        <Text style={styles.title}>Registro de Usuario</Text>
                        <Text style={styles.subtitle}>
                            Ingrese sus datos para generar la solicitud. La directiva verificará su estado.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {error ? (
                            <View style={styles.errorAlert}>
                                <Text style={styles.errorAlertText}>{error}</Text>
                            </View>
                        ) : null}

                        <Field
                            label="Nombres"
                            value={formData.nombres}
                            onChangeText={(v) => handleChange('nombres', v)}
                            placeholder="Ej: Juan Pablo"
                            error={formErrors.nombres}
                        />
                        <Field
                            label="Apellidos"
                            value={formData.apellidos}
                            onChangeText={(v) => handleChange('apellidos', v)}
                            placeholder="Ej: Pérez Gómez"
                            error={formErrors.apellidos}
                        />
                        <Field
                            label="CI/RUC"
                            value={formData.ci_ruc}
                            onChangeText={(v) => handleChange('ci_ruc', v)}
                            placeholder="Ej: 17XXXXXXXX"
                            error={formErrors.ci_ruc}
                            keyboardType="numeric"
                        />
                        <Field
                            label="#Casa"
                            value={formData.casa}
                            onChangeText={(v) => handleChange('casa', v)}
                            placeholder="Ej: A-12"
                            error={formErrors.casa}
                        />
                        <Field
                            label="Correo electrónico"
                            value={formData.correo}
                            onChangeText={(v) => handleChange('correo', v)}
                            placeholder="correo@ejemplo.com"
                            error={formErrors.correo}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Field
                            label="Contraseña"
                            value={formData.password}
                            onChangeText={(v) => handleChange('password', v)}
                            placeholder="••••••••"
                            error={formErrors.password}
                            secureTextEntry
                        />
                        <Field
                            label="Confirmar Contraseña"
                            value={formData.confirmPassword}
                            onChangeText={(v) => handleChange('confirmPassword', v)}
                            placeholder="••••••••"
                            error={formErrors.confirmPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
                            {foto ? (
                                <Image source={{ uri: foto.uri }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.uploadIcon}>
                                    <MaterialIcons name="cloud_upload" size={22} color="#584237" />
                                </View>
                            )}
                            <Text style={styles.uploadLabel}>
                                {foto ? 'Cambiar foto' : 'Subir Foto (Opcional)'}
                            </Text>
                            <Text style={styles.uploadHint}>PNG o JPG</Text>
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
                                    <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                                    <MaterialIcons name="arrow_forward" size={18} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Iniciar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const Field = ({ label, error, ...inputProps }) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholderTextColor="#9ca3af"
            {...inputProps}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    header: {
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 10, marginBottom: 6 },
    subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
    form: { padding: 20 },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#584237',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e3e5',
        borderRadius: 8,
        backgroundColor: '#f7f9fb',
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#191c1e',
    },
    inputError: { borderColor: '#dc2626' },
    errorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },
    uploadArea: {
        alignItems: 'center',
        padding: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#e0c0b1',
        borderRadius: 12,
        backgroundColor: '#f7f9fb',
        marginBottom: 20,
    },
    uploadIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f2f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    previewImage: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
    uploadLabel: { fontSize: 12, fontWeight: '600', color: '#f97316' },
    uploadHint: { fontSize: 12, color: '#584237', marginTop: 4 },
    submitButton: {
        backgroundColor: '#f97316',
        borderRadius: 8,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 14, marginRight: 6 },
    errorAlert: {
        padding: 12,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fee2e2',
        borderRadius: 8,
        marginBottom: 16,
    },
    errorAlertText: { color: '#b91c1c', fontSize: 13 },
    footer: {
        padding: 16,
        backgroundColor: '#f2f4f6',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginLink: { color: '#f97316', fontWeight: '700', fontSize: 13 },
    successBlock: { padding: 24, alignItems: 'center' },
});

export default RegisterScreen;
