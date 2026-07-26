import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import useVisitantes from '../../../hooks/useVisitantes';
import useViviendas from '../../../hooks/useViviendas';
import Layout from '../../../components/comunes/Layout/Layout';
import PageHeader from '../../../components/comunes/PageHeader/PageHeader';
import LoadingSpinner from '../../../components/comunes/LoadingSpinner/LoadingSpinner';
import styles from './GeneratePass.module.css';

const GeneratePass = () => {
    const navigate = useNavigate();
    const { data: pasesHoy, loading: loadingPases, crearVisitante } = useVisitantes();
    const { data: viviendas } = useViviendas();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    const [idViviendaDestino, setIdViviendaDestino] = useState('');
    const [numPersonas, setNumPersonas] = useState(1);
    const [validoDesde, setValidoDesde] = useState('');
    const [validoHasta, setValidoHasta] = useState('');
    const [tieneVehiculo, setTieneVehiculo] = useState(false);
    const [placa, setPlaca] = useState('');
    const qrCanvasRef = useRef(null);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [lastGenerated, setLastGenerated] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (tieneVehiculo && !placa) {
            setFormError('Debe indicar la placa si el visitante tiene vehículo');
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
            valido_desde: validoDesde,
            valido_hasta: validoHasta,
        });
        setSubmitting(false);

        if (result.success) {
            setLastGenerated({
                nombre,
                apellido,
                cedula,
                numPersonas,
                idViviendaDestino,
                validoDesde,
                validoHasta,
                tieneVehiculo,
                placa,
                codigo_qr: result.codigo_qr,
            });
        } else {
            setFormError(result.error);
        }
    };

    const handleShareWhatsApp = async () => {
        if (!lastGenerated) return;

        const text = `Pase de Visita CondoSecure para ${lastGenerated.nombre} ${lastGenerated.apellido}.\nCI: ${lastGenerated.cedula}\nVálido: ${lastGenerated.validoDesde} - ${lastGenerated.validoHasta}`;

        // Intentar obtener el canvas del QR y convertirlo a imagen
        const canvas = qrCanvasRef.current;
        let file = null;

        if (canvas) {
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                file = new File([blob], 'pase-qr.png', { type: 'image/png' });
            }
        }

        // Web Share API con archivo (funciona en móviles y algunos navegadores de escritorio compatibles)
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Pase de Visita CondoSecure',
                    text,
                });
                return;
            } catch (err) {
                // El usuario canceló el share o falló — seguimos al fallback
                if (err.name === 'AbortError') return;
            }
        }

        // Fallback: el navegador no soporta compartir archivos (ej. Chrome/Edge de escritorio)
        // Descargamos la imagen automáticamente y abrimos WhatsApp Web solo con el texto,
        // para que el usuario adjunte la imagen manualmente.
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'pase-qr.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const viviendaSeleccionadaLabel = (id) => {
        const v = viviendas.find((viv) => viv.id_vivienda === Number(id));
        return v ? `Casa ${v.numero}` : '';
    };

    return (
        <Layout>
            <div className={styles.container}>
                <PageHeader
                    breadcrumbs={['Seguridad', 'Generar Pase']}
                    title="Generar Pase de Visita"
                    subtitle="Complete el formulario para crear un código QR de acceso temporal."
                />

                {formError && (
                    <div className={styles.warningBanner}>
                        <span className="material-symbols-outlined">error</span>
                        <span>{formError}</span>
                    </div>
                )}

                <div className={styles.mainGrid}>
                    {/* Left Column: Form */}
                    <section className={styles.panel}>
                        <h3 className={styles.panelTitle}>Datos del Visitante</h3>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.gridTwo}>
                                <div>
                                    <label className={styles.label}>Nombre</label>
                                    <input
                                        className={styles.input}
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej. Ana"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Apellido</label>
                                    <input
                                        className={styles.input}
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        placeholder="Ej. López"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={styles.label}>CI/Cédula</label>
                                <input
                                    className={styles.input}
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                    placeholder="Ej. 1712345678"
                                    required
                                />
                            </div>

                            <div className={styles.gridTwo}>
                                <div>
                                    <label className={styles.label}>Vivienda Destino</label>
                                    <select
                                        className={styles.input}
                                        value={idViviendaDestino}
                                        onChange={(e) => setIdViviendaDestino(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona...</option>
                                        {viviendas.map((v) => (
                                            <option key={v.id_vivienda} value={v.id_vivienda}>
                                                Casa {v.numero}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={styles.label}># de personas que ingresan</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        min="1"
                                        value={numPersonas}
                                        onChange={(e) => setNumPersonas(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.gridTwo}>
                                <div>
                                    <label className={styles.label}>Válido Desde</label>
                                    <input
                                        className={styles.input}
                                        type="datetime-local"
                                        value={validoDesde}
                                        onChange={(e) => setValidoDesde(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Válido Hasta</label>
                                    <input
                                        className={styles.input}
                                        type="datetime-local"
                                        value={validoHasta}
                                        onChange={(e) => setValidoHasta(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.vehicleRow}>
                                <div>
                                    <span className={styles.label}>Vehículo</span>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                checked={tieneVehiculo === true}
                                                onChange={() => setTieneVehiculo(true)}
                                            />
                                            <span>Sí</span>
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                checked={tieneVehiculo === false}
                                                onChange={() => {
                                                    setTieneVehiculo(false);
                                                    setPlaca('');
                                                }}
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>
                                </div>

                                {tieneVehiculo && (
                                    <div className={styles.plateField}>
                                        <label className={styles.label}>Placa</label>
                                        <input
                                            className={`${styles.input} ${styles.inputUppercase}`}
                                            value={placa}
                                            onChange={(e) => setPlaca(e.target.value)}
                                            placeholder="ABC-123"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.submitRow}>
                                <button className={styles.submitButton} type="submit" disabled={submitting}>
                                    <span className="material-symbols-outlined">qr_code_2</span>
                                    <span>{submitting ? 'Generando...' : 'Generar Código QR'}</span>
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Right Column: Last Generated Pass */}
                    <section className={styles.previewPanel}>
                        <div className={styles.previewHeader}>
                            <h3 className={styles.panelTitle}>Último Pase Generado</h3>
                        </div>

                        {!lastGenerated ? (
                            <p className={styles.emptyPreview}>
                                Genera un pase para ver aquí el código QR y sus detalles.
                            </p>
                        ) : (
                            <>
                                <div className={styles.qrWrapper}>
                                    <QRCodeCanvas
                                        value={lastGenerated.codigo_qr}
                                        size={192}
                                        className={styles.qrImage}
                                        ref={qrCanvasRef}
                                    />
                                </div>

                                <div className={styles.detailsBox}>
                                    <div className={styles.detailRow}>
                                        <p className={styles.detailLabel}>Visitante</p>
                                        <p className={styles.detailValue}>
                                            {lastGenerated.nombre} {lastGenerated.apellido}
                                        </p>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <p className={styles.detailLabel}>CI/Cédula</p>
                                        <p className={styles.detailValue}>{lastGenerated.cedula}</p>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <p className={styles.detailLabel}>Válido para</p>
                                        <p className={styles.detailValue}>
                                            {lastGenerated.validoDesde} - {lastGenerated.validoHasta}
                                        </p>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <p className={styles.detailLabel}>Destino</p>
                                        <p className={styles.detailValue}>
                                            {viviendaSeleccionadaLabel(lastGenerated.idViviendaDestino)}
                                        </p>
                                    </div>
                                    <div className={`${styles.detailRow} ${styles.detailRowLast}`}>
                                        <p className={styles.detailLabel}>Vehículo</p>
                                        <p className={styles.detailValue}>
                                            {lastGenerated.tieneVehiculo ? `Sí (${lastGenerated.placa})` : 'No'}
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.actionsColumn}>
                                    <button onClick={handleShareWhatsApp} className={styles.whatsappButton}>
                                        <span className="material-symbols-outlined">share</span>
                                        <span>Compartir por WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/seguridad/escanear')}
                                        className={styles.scannerLinkButton}
                                    >
                                        <span className="material-symbols-outlined">qr_code_scanner</span>
                                        <span>Ir al Escáner de Garita</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>

                {/* Pases de Hoy */}
                <section className={styles.todayPanel}>
                    <h3 className={styles.panelTitle}>Pases de Hoy</h3>
                    {loadingPases ? (
                        <LoadingSpinner />
                    ) : pasesHoy.length === 0 ? (
                        <p className={styles.emptyPreview}>No hay pases generados hoy.</p>
                    ) : (
                        <div className={styles.todayTableWrapper}>
                            <table className={styles.todayTable}>
                                <thead>
                                    <tr>
                                        <th>Visitante</th>
                                        <th>Casa</th>
                                        <th>Válido Desde</th>
                                        <th>Válido Hasta</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pasesHoy.map((p) => (
                                        <tr key={p.id_visitante}>
                                            <td>{p.nombre} {p.apellido}</td>
                                            <td>{p.numero_vivienda}</td>
                                            <td>{p.valido_desde}</td>
                                            <td>{p.valido_hasta}</td>
                                            <td>
                                                <span className={styles.estadoBadge}>{p.estado_qr}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
};

export default GeneratePass;