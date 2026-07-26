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
    Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import useVisitantes from '../hooks/useVisitantes';
import useViviendas from '../hooks/useViviendas';

const formatDateTime = (date) =>
    date
        ? `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })}`
        : '';

const GeneratePassScreen = ({ navigation }) => {
    const { data: pasesHoy, loading: loadingPases, crearVisitante } = useVisitantes();
    const { data: viviendas } = useViviendas();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    const [idViviendaDestino, setIdViviendaDestino] = useState('');
    const [numPersonas, setNumPersonas] = useState('1');
    const [validoDesde, setValidoDesde] = useState(null);
    const [validoHasta, setValidoHasta] = useState(null);
    const [showPickerDesde, setShowPickerDesde] = useState(false);
    const [showPickerHasta, setShowPickerHasta] = useState(false);
    const [tieneVehiculo, setTieneVehiculo] = useState(false);
    const [placa, setPlaca] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [lastGenerated, setLastGenerated] = useState(null);

    const handleSubmit = async () => {
        setFormError(null);

        if (tieneVehiculo && !placa) {
            setFormError('Debe indicar la placa si el visitante tiene vehículo');
            return;
        }
        if (!idViviendaDestino || !validoDesde || !validoHasta) {
            setFormError('Complete todos los campos requeridos');
            return;
        }

        setSubmitting(true);
        const result = await crearVisitante({
            nombre,
            apellido,
            cedula,
            num_personas: Number(numPersonas),
            tiene_vehiculo: tieneVehiculo,
            placa: tieneVehiculo ? placa : undefined,
            id_vivienda_destino: Number(idViviendaDestino),
            valido_desde: validoDesde.toISOString(),
            valido_hasta: validoHasta.toISOString(),
        });
        setSubmitting(false);

        if (result.success) {
            setLastGenerated({
                nombre,
                apellido,
                cedula,
                idViviendaDestino,
                validoDesde: formatDateTime(validoDesde),
                validoHasta: formatDateTime(validoHasta),
                tieneVehiculo,
                placa,
                codigo_qr: result.codigo_qr,
            });
        } else {
            setFormError(result.error);
        }
    };

    const handleShareWhatsApp = () => {
        if (!lastGenerated) return;
        const text = encodeURIComponent(
            `Pase de Visita CondoSecure para ${lastGenerated.nombre} ${lastGenerated.apellido}.\nCI: ${lastGenerated.cedula}\nVálido: ${lastGenerated.validoDesde} - ${lastGenerated.validoHasta}`
        );
        Linking.openURL(`https://api.whatsapp.com/send?text=${text}`);
    };

    const viviendaSeleccionadaLabel = (id) => {
        const v = viviendas.find((viv) => viv.id_vivienda === Number(id));
        return v ? `Casa ${v.numero}` : '';
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.pageTitle}>Generar Pase de Visita</Text>
            <Text style={styles.pageSubtitle}>
                Complete el formulario para crear un código QR de acceso temporal.
            </Text>

            {formError ? (
                <View style={styles.warningBanner}>
                    <MaterialIcons name="error" size={18} color="#991b1b" />
                    <Text style={styles.warningText}>{formError}</Text>
                </View>
            ) : null}

            {/* Formulario */}
            <View style={styles.panel}>
                <Text style={styles.panelTitle}>Datos del Visitante</Text>

                <Field label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej. Ana" />
                <Field
                    label="Apellido"
                    value={apellido}
                    onChangeText={setApellido}
                    placeholder="Ej. López"
                />
                <Field
                    label="CI/Cédula"
                    value={cedula}
                    onChangeText={setCedula}
                    placeholder="Ej. 1712345678"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Vivienda Destino</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={idViviendaDestino}
                        onValueChange={(v) => setIdViviendaDestino(v)}
                    >
                        <Picker.Item label="Selecciona..." value="" />
                        {viviendas.map((v) => (
                            <Picker.Item key={v.id_vivienda} label={`Casa ${v.numero}`} value={String(v.id_vivienda)} />
                        ))}
                    </Picker>
                </View>

                <Field
                    label="# de personas que ingresan"
                    value={numPersonas}
                    onChangeText={setNumPersonas}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Válido Desde</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerDesde(true)}>
                    <Text style={validoDesde ? styles.dateText : styles.datePlaceholder}>
                        {validoDesde ? formatDateTime(validoDesde) : 'Selecciona fecha y hora'}
                    </Text>
                    <MaterialIcons name="event" size={18} color="#584237" />
                </TouchableOpacity>
                {showPickerDesde && (
                    <DateTimePicker
                        value={validoDesde || new Date()}
                        mode="datetime"
                        onChange={(event, date) => {
                            setShowPickerDesde(false);
                            if (date) setValidoDesde(date);
                        }}
                    />
                )}

                <Text style={styles.label}>Válido Hasta</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerHasta(true)}>
                    <Text style={validoHasta ? styles.dateText : styles.datePlaceholder}>
                        {validoHasta ? formatDateTime(validoHasta) : 'Selecciona fecha y hora'}
                    </Text>
                    <MaterialIcons name="event" size={18} color="#584237" />
                </TouchableOpacity>
                {showPickerHasta && (
                    <DateTimePicker
                        value={validoHasta || new Date()}
                        mode="datetime"
                        onChange={(event, date) => {
                            setShowPickerHasta(false);
                            if (date) setValidoHasta(date);
                        }}
                    />
                )}

                <Text style={styles.label}>Vehículo</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioOption} onPress={() => setTieneVehiculo(true)}>
                        <MaterialIcons
                            name={tieneVehiculo ? 'radio_button_checked' : 'radio_button_unchecked'}
                            size={18}
                            color="#f97316"
                        />
                        <Text style={styles.radioLabel}>Sí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => {
                            setTieneVehiculo(false);
                            setPlaca('');
                        }}
                    >
                        <MaterialIcons
                            name={!tieneVehiculo ? 'radio_button_checked' : 'radio_button_unchecked'}
                            size={18}
                            color="#f97316"
                        />
                        <Text style={styles.radioLabel}>No</Text>
                    </TouchableOpacity>
                </View>

                {tieneVehiculo && (
                    <Field
                        label="Placa"
                        value={placa}
                        onChangeText={(v) => setPlaca(v.toUpperCase())}
                        placeholder="ABC-123"
                        autoCapitalize="characters"
                    />
                )}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.8}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="qr_code_2" size={18} color="#fff" />
                            <Text style={styles.submitButtonText}>Generar Código QR</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Último pase generado */}
            <View style={styles.previewPanel}>
                <Text style={styles.panelTitle}>Último Pase Generado</Text>

                {!lastGenerated ? (
                    <Text style={styles.emptyPreview}>
                        Genera un pase para ver aquí el código QR y sus detalles.
                    </Text>
                ) : (
                    <>
                        <View style={styles.qrWrapper}>
                            <Image source={{ uri: lastGenerated.codigo_qr }} style={styles.qrImage} />
                        </View>

                        <View style={styles.detailsBox}>
                            <DetailRow label="Visitante" value={`${lastGenerated.nombre} ${lastGenerated.apellido}`} />
                            <DetailRow label="CI/Cédula" value={lastGenerated.cedula} />
                            <DetailRow
                                label="Válido para"
                                value={`${lastGenerated.validoDesde} - ${lastGenerated.validoHasta}`}
                            />
                            <DetailRow
                                label="Destino"
                                value={viviendaSeleccionadaLabel(lastGenerated.idViviendaDestino)}
                            />
                            <DetailRow
                                label="Vehículo"
                                value={lastGenerated.tieneVehiculo ? `Sí (${lastGenerated.placa})` : 'No'}
                                last
                            />
                        </View>

                        <TouchableOpacity style={styles.whatsappButton} onPress={handleShareWhatsApp}>
                            <MaterialIcons name="share" size={18} color="#15803d" />
                            <Text style={styles.whatsappButtonText}>Compartir por WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.scannerLinkButton}
                            onPress={() => navigation.navigate('Scanner')}
                        >
                            <MaterialIcons name="qr_code_scanner" size={16} color="#191c1e" />
                            <Text style={styles.scannerLinkText}>Ir al Escáner de Garita</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Pases de hoy */}
            <View style={styles.todayPanel}>
                <Text style={styles.panelTitle}>Pases de Hoy</Text>
                {loadingPases ? (
                    <ActivityIndicator color="#f97316" />
                ) : pasesHoy.length === 0 ? (
                    <Text style={styles.emptyPreview}>No hay pases generados hoy.</Text>
                ) : (
                    pasesHoy.map((p) => (
                        <View key={p.id_visitante} style={styles.todayRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.todayName}>
                                    {p.nombre} {p.apellido}
                                </Text>
                                <Text style={styles.todaySub}>Casa {p.numero_vivienda}</Text>
                                <Text style={styles.todaySub}>
                                    {p.valido_desde} - {p.valido_hasta}
                                </Text>
                            </View>
                            <View style={styles.estadoBadge}>
                                <Text style={styles.estadoBadgeText}>{p.estado_qr}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const Field = ({ label, ...inputProps }) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>{label}</Text>
        <TextInput style={styles.input} placeholderTextColor="#9ca3af" {...inputProps} />
    </View>
);

const DetailRow = ({ label, value, last }) => (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f9fb' },
    pageTitle: { fontSize: 20, fontWeight: '700', color: '#191c1e' },
    pageSubtitle: { fontSize: 13, color: '#584237', marginTop: 4, marginBottom: 16 },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    warningText: { color: '#991b1b', fontSize: 13, flex: 1 },
    panel: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e3e5',
        padding: 16,
        marginBottom: 16,
    },
    panelTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: '#191c1e',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e3e5',
        paddingBottom: 10,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: '#584237',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f7f9fb',
        borderWidth: 1,
        borderColor: '#e0e3e5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#191c1e',
    },
    pickerWrapper: {
        backgroundColor: '#f7f9fb',
        borderWidth: 1,
        borderColor: '#e0e3e5',
        borderRadius: 6,
        marginBottom: 16,
        overflow: 'hidden',
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f7f9fb',
        borderWidth: 1,
        borderColor: '#e0e3e5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 16,
    },
    dateText: { fontSize: 14, color: '#191c1e' },
    datePlaceholder: { fontSize: 14, color: '#9ca3af' },
    radioGroup: { flexDirection: 'row', gap: 24, marginBottom: 16 },
    radioOption: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    radioLabel: { fontSize: 14, color: '#191c1e' },
    submitButton: {
        backgroundColor: '#f97316',
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
    },
    submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    previewPanel: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e3e5',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    emptyPreview: { textAlign: 'center', color: '#6b7280', fontSize: 13, paddingVertical: 24 },
    qrWrapper: { marginBottom: 16 },
    qrImage: { width: 180, height: 180, borderRadius: 8 },
    detailsBox: {
        width: '100%',
        backgroundColor: '#f7f9fb',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e3e5',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(224,227,229,0.6)',
    },
    detailRowLast: { borderBottomWidth: 0 },
    detailLabel: { fontSize: 11, fontWeight: '600', color: '#584237', textTransform: 'uppercase' },
    detailValue: { fontSize: 13, fontWeight: '600', color: '#191c1e' },
    whatsappButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: '#16a34a',
        borderRadius: 8,
        paddingVertical: 10,
        marginBottom: 8,
    },
    whatsappButtonText: { color: '#15803d', fontWeight: '600', fontSize: 13 },
    scannerLinkButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#f2f4f6',
        borderRadius: 8,
        paddingVertical: 10,
    },
    scannerLinkText: { color: '#191c1e', fontWeight: '600', fontSize: 12 },
    todayPanel: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e3e5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    todayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    todayName: { fontSize: 13, fontWeight: '600', color: '#191c1e' },
    todaySub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
    estadoBadge: {
        backgroundColor: '#dae2fd',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    estadoBadgeText: { fontSize: 11, fontWeight: '600', color: '#3f465c' },
});

export default GeneratePassScreen;
