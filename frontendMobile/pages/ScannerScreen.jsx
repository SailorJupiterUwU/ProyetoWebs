import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import useQr from '../hooks/useQr';

const ScannerScreen = ({ navigation }) => {
    const { validar, registrarIngreso, registrarSalida, revocar, validando, procesando } = useQr();
    const [permission, requestPermission] = useCameraPermissions();

    const [scanResult, setScanResult] = useState(null);
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [actionMsg, setActionMsg] = useState(null);
    const [cameraActive, setCameraActive] = useState(true);
    const lastScanned = useRef(null);

    const handleBarcodeScanned = async ({ data }) => {
        if (validando || data === lastScanned.current) return;
        lastScanned.current = data;
        setCameraActive(false);
        const result = await validar(data);
        setScanResult(result);
        setActionMsg(null);
    };

    const handleManualSubmit = async () => {
        const result = await validar(manualCode.trim());
        setScanResult(result);
        setActionMsg(null);
        setShowManualModal(false);
        setManualCode('');
    };

    const resetScan = () => {
        setScanResult(null);
        setActionMsg(null);
        lastScanned.current = null;
        setCameraActive(true);
    };

    const qrId = scanResult?.visitante?.id_visitante;

    const handleAction = async (action) => {
        if (!qrId) return;
        let result;
        if (action === 'ingreso') result = await registrarIngreso(qrId);
        if (action === 'salida') result = await registrarSalida(qrId);
        if (action === 'revocar') result = await revocar(qrId);

        if (result.success) {
            setActionMsg({
                type: 'success',
                text: `${action === 'ingreso' ? 'Ingreso' : action === 'salida' ? 'Salida' : 'QR revocado'
                    } registrado correctamente.`,
            });
        } else {
            setActionMsg({ type: 'error', text: result.error });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={styles.pageTitle}>Garita Principal</Text>
                <Text style={styles.pageSubtitle}>Control de Acceso</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Lector de Código</Text>

                    <View style={styles.cameraViewport}>
                        {!permission ? (
                            <ActivityIndicator color="#f97316" />
                        ) : !permission.granted ? (
                            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                                <MaterialIcons name="camera-alt" size={32} color="#f97316" />
                                <Text style={styles.permissionText}>Otorgar permiso de cámara</Text>
                            </TouchableOpacity>
                        ) : cameraActive ? (
                            <CameraView
                                style={styles.camera}
                                facing="back"
                                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                                onBarcodeScanned={handleBarcodeScanned}
                            />
                        ) : (
                            <View style={styles.cameraFrozen}>
                                <MaterialCommunityIcons name="qrcode-scan" size={56} color="rgba(249,115,22,0.5)" />
                            </View>
                        )}
                        <View style={styles.scanFrame} pointerEvents="none" />
                    </View>

                    <View style={styles.waitingBlock}>
                        <Text style={styles.waitingText}>
                            {validando ? 'Validando código...' : 'Apunta la cámara al código QR'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowManualModal(true)}>
                            <Text style={styles.manualLink}>Ingresar código manualmente</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    {!scanResult ? (
                        <Text style={styles.waitingText}>Aún no se ha validado ningún código.</Text>
                    ) : (
                        <>
                            <Text style={styles.cardTitle}>Resultado de Validación</Text>

                            {scanResult.valido ? (
                                <View style={styles.statusBlock}>
                                    <View style={[styles.statusIconWrap, styles.statusIconValid]}>
                                        <MaterialIcons name="check-circle" size={40} color="#16a34a" />
                                    </View>
                                    <Text style={[styles.statusHeading, styles.statusHeadingValid]}>VÁLIDO</Text>
                                    <Text style={[styles.statusSub, styles.statusSubValid]}>ACCESO PERMITIDO</Text>
                                </View>
                            ) : (
                                <View style={styles.statusBlock}>
                                    <View style={[styles.statusIconWrap, styles.statusIconInvalid]}>
                                        <MaterialIcons name="cancel" size={40} color="#dc2626" />
                                    </View>
                                    <Text style={[styles.statusHeading, styles.statusHeadingInvalid]}>NO VÁLIDO</Text>
                                    <Text style={[styles.statusSub, styles.statusSubInvalid]}>
                                        {scanResult.motivo || 'ACCESO DENEGADO'}
                                    </Text>
                                </View>
                            )}

                            {scanResult.valido && scanResult.visitante && (
                                <View style={styles.dataModule}>
                                    <DataRow
                                        label="VISITANTE"
                                        value={`${scanResult.visitante.nombre} ${scanResult.visitante.apellido}`}
                                    />
                                    <DataRow label="CI/CÉDULA" value={scanResult.visitante.cedula} mono />
                                    <DataRow label="PERSONAS" value={String(scanResult.visitante.num_personas)} />
                                    <DataRow label="DESTINO" value={scanResult.visitante.vivienda_destino} />
                                    <DataRow
                                        label="VEHÍCULO"
                                        value={
                                            scanResult.visitante.tiene_vehiculo
                                                ? `Sí (${scanResult.visitante.placa})`
                                                : 'No'
                                        }
                                        last
                                    />
                                </View>
                            )}

                            {scanResult.valido && qrId && (
                                <View style={styles.qrActions}>
                                    <TouchableOpacity
                                        style={styles.ingresoBtn}
                                        onPress={() => handleAction('ingreso')}
                                        disabled={procesando}
                                    >
                                        <MaterialIcons name="login" size={18} color="#fff" />
                                        <Text style={styles.actionBtnText}>Registrar Ingreso</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.salidaBtn}
                                        onPress={() => handleAction('salida')}
                                        disabled={procesando}
                                    >
                                        <MaterialIcons name="logout" size={18} color="#fff" />
                                        <Text style={styles.actionBtnText}>Registrar Salida</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.revocarBtn}
                                        onPress={() => handleAction('revocar')}
                                        disabled={procesando}
                                    >
                                        <MaterialIcons name="block" size={18} color="#dc2626" />
                                        <Text style={styles.revocarBtnText}>Revocar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {actionMsg && (
                                <View
                                    style={
                                        actionMsg.type === 'success' ? styles.actionMsgSuccess : styles.actionMsgError
                                    }
                                >
                                    <Text
                                        style={
                                            actionMsg.type === 'success'
                                                ? styles.actionMsgSuccessText
                                                : styles.actionMsgErrorText
                                        }
                                    >
                                        {actionMsg.text}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity style={styles.rescanButton} onPress={resetScan}>
                                <MaterialCommunityIcons name="qrcode-scan" size={16} color="#191c1e" />
                                <Text style={styles.rescanText}>Escanear otro código</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => navigation.navigate('GeneratePass')}
                >
                    <MaterialCommunityIcons name="qrcode" size={16} color="#191c1e" />
                    <Text style={styles.backLinkText}>Ir a Generar Pase de Visita</Text>
                </TouchableOpacity>

                <Modal visible={showManualModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Ingreso Manual de Código QR</Text>
                                <TouchableOpacity onPress={() => setShowManualModal(false)}>
                                    <MaterialIcons name="close" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.formLabel}>Código del Visitante</Text>
                            <TextInput
                                style={styles.formInput}
                                value={manualCode}
                                onChangeText={setManualCode}
                                autoCapitalize="none"
                            />

                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowManualModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalSubmitButton}
                                    onPress={handleManualSubmit}
                                    disabled={validando}
                                >
                                    <Text style={styles.modalSubmitButtonText}>
                                        {validando ? 'Validando...' : 'Validar Código'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
};

const DataRow = ({ label, value, mono, last }) => (
    <View style={[styles.dataRow, last && styles.dataRowLast]}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={[styles.dataValue, mono && styles.dataValueMono]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f9fb' },
    pageTitle: { fontSize: 20, fontWeight: '700', color: '#191c1e' },
    pageSubtitle: { fontSize: 13, color: '#584237', marginBottom: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e0e3e5',
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: '#191c1e',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e3e5',
        paddingBottom: 10,
    },
    cameraViewport: {
        width: '100%',
        height: 260,
        backgroundColor: '#2d3133',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    camera: { width: '100%', height: '100%' },
    cameraFrozen: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    permissionButton: { alignItems: 'center', gap: 8 },
    permissionText: { color: '#f97316', fontSize: 13, fontWeight: '600' },
    scanFrame: {
        position: 'absolute',
        top: 24,
        left: 24,
        right: 24,
        bottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(249,115,22,0.5)',
        borderRadius: 8,
    },
    waitingBlock: { alignItems: 'center', gap: 8 },
    waitingText: { fontSize: 14, color: '#584237', fontWeight: '500', textAlign: 'center' },
    manualLink: {
        fontSize: 12,
        fontWeight: '600',
        color: '#f97316',
        textDecorationLine: 'underline',
    },
    statusBlock: { alignItems: 'center', marginBottom: 16 },
    statusIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statusIconValid: { backgroundColor: '#dcfce7' },
    statusIconInvalid: { backgroundColor: '#fee2e2' },
    statusHeading: { fontSize: 24, fontWeight: '700' },
    statusHeadingValid: { color: '#15803d' },
    statusHeadingInvalid: { color: '#b91c1c' },
    statusSub: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
    statusSubValid: { color: '#16a34a' },
    statusSubInvalid: { color: '#dc2626' },
    dataModule: {
        backgroundColor: '#f2f4f6',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e0e3e5',
        gap: 10,
        marginBottom: 16,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e3e5',
        paddingBottom: 8,
    },
    dataRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
    dataLabel: { fontSize: 11, fontWeight: '600', color: '#584237', textTransform: 'uppercase' },
    dataValue: { fontSize: 13, fontWeight: '600', color: '#191c1e' },
    dataValueMono: { fontFamily: 'monospace' },
    qrActions: { gap: 8, marginBottom: 8 },
    ingresoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#16a34a',
        paddingVertical: 12,
        borderRadius: 8,
    },
    salidaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#505f76',
        paddingVertical: 12,
        borderRadius: 8,
    },
    revocarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 8,
    },
    actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    revocarBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
    actionMsgSuccess: {
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        borderRadius: 8,
        padding: 10,
    },
    actionMsgSuccessText: { color: '#166534', fontSize: 12, textAlign: 'center' },
    actionMsgError: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 8,
        padding: 10,
    },
    actionMsgErrorText: { color: '#991b1b', fontSize: 12, textAlign: 'center' },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
    },
    rescanText: { fontSize: 12, fontWeight: '600', color: '#191c1e' },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#f2f4f6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 24,
    },
    backLinkText: { fontSize: 12, fontWeight: '600', color: '#191c1e' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    modal: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        marginBottom: 16,
    },
    modalTitle: { fontWeight: '700', fontSize: 16, color: '#111827' },
    formLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
    formInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 16,
    },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
    },
    cancelButtonText: { color: '#374151', fontSize: 13 },
    modalSubmitButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f97316',
        borderRadius: 8,
    },
    modalSubmitButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

export default ScannerScreen;
