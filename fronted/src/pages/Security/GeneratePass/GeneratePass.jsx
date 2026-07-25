import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GeneratePass.module.css';
import Layout from '../../../components/comunes/Layout/Layout';
import PageHeader from '../../../components/comunes/PageHeader/PageHeader';

const GeneratePass = () => {
    const navigate = useNavigate();

    // Mock local — luego esto vendrá de un fetch al backend (GET /pases/activo)
    const [activePass, setActivePass] = useState({
        visitorName: 'Ana',
        visitorLastName: 'López',
        visitorDoc: '1712345678',
        houseNumber: 'Casa B-12',
        peopleCount: 1,
        entryTime: 'Hoy, 15:00',
        exitTime: '18:00',
        hasVehicle: 'no',
        plateNumber: '',
        status: 'Activo', // el backend definirá si hay un pase activo o no
    });

    const canGenerate = activePass.status === 'Activo';

    const [firstName, setFirstName] = useState(activePass.visitorName);
    const [lastName, setLastName] = useState(activePass.visitorLastName);
    const [docId, setDocId] = useState(activePass.visitorDoc);
    const [house, setHouse] = useState(activePass.houseNumber.replace('Casa ', ''));
    const [peopleCount, setPeopleCount] = useState(activePass.peopleCount);
    const [entryDatetime, setEntryDatetime] = useState('');
    const [exitDatetime, setExitDatetime] = useState('');
    const [hasVehicle, setHasVehicle] = useState(activePass.hasVehicle);
    const [plate, setPlate] = useState(activePass.plateNumber);

    const [generatedNotification, setGeneratedNotification] = useState(false);

    const handleGenerateQR = (e) => {
        e.preventDefault();
        if (!canGenerate) return;

        const updatedPass = {
            visitorName: firstName || 'Ana',
            visitorLastName: lastName || 'López',
            visitorDoc: docId || '1712345678',
            houseNumber: house ? `Casa ${house}` : 'Casa B-12',
            peopleCount: Number(peopleCount) || 1,
            entryTime: entryDatetime
                ? new Date(entryDatetime).toLocaleString('es-EC', { hour: '2-digit', minute: '2-digit' })
                : 'Hoy, 15:00',
            exitTime: exitDatetime
                ? new Date(exitDatetime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
                : '18:00',
            hasVehicle,
            plateNumber: plate || 'ABC-123',
            status: 'Activo',
        };
        setActivePass(updatedPass);
        setGeneratedNotification(true);
        setTimeout(() => setGeneratedNotification(false), 3000);
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(
            `Pase de Visita CondoSecure para ${activePass.visitorName} ${activePass.visitorLastName}.\nCI: ${activePass.visitorDoc}\nDestino: ${activePass.houseNumber}\nAcceso permitido: ${activePass.entryTime} - ${activePass.exitTime}`
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    return (
        <Layout>
            <div className={styles.container}>
                {/* Toast Notification */}
                {generatedNotification && (
                    <div className={styles.toast}>
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>¡Código QR generado con éxito! El pase activo se ha actualizado.</span>
                    </div>
                )}

                {/* Blocked Notice */}
                {!canGenerate && (
                    <div className={styles.warningBanner}>
                        <span className="material-symbols-outlined">block</span>
                        <span>No tienes un pase activo en este momento. No es posible generar un nuevo código QR.</span>
                    </div>
                )}
                
                <PageHeader
                    breadcrumbs={['Seguridad QR', 'Generar Pase']}
                    title="Generar Pase de Visita"
                    subtitle="Complete el formulario para crear un código QR de acceso temporal."
                />

                {/* Main Layout Grid */}
                <div className={styles.mainGrid}>
                    {/* Left Column: Form */}
                    <section className={styles.panel}>
                        <h3 className={styles.panelTitle}>Datos del Visitante</h3>

                        <form onSubmit={handleGenerateQR} className={styles.form}>
                            <fieldset disabled={!canGenerate} className={styles.fieldset}>
                                <div className={styles.gridTwo}>
                                    <div>
                                        <label className={styles.label} htmlFor="visitor-firstname">Nombre</label>
                                        <input
                                            className={styles.input}
                                            id="visitor-firstname"
                                            name="visitor-firstname"
                                            placeholder="Ej. Ana"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            type="text"
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label} htmlFor="visitor-lastname">Apellido</label>
                                        <input
                                            className={styles.input}
                                            id="visitor-lastname"
                                            name="visitor-lastname"
                                            placeholder="Ej. López"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.label} htmlFor="visitor-id">CI/Cédula</label>
                                    <input
                                        className={styles.input}
                                        id="visitor-id"
                                        name="visitor-id"
                                        placeholder="Ej. 12345678"
                                        value={docId}
                                        onChange={(e) => setDocId(e.target.value)}
                                        required
                                        type="text"
                                    />
                                </div>

                                <div className={styles.gridTwo}>
                                    <div>
                                        <label className={styles.label} htmlFor="house-number"># de Casa</label>
                                        <input
                                            className={styles.input}
                                            id="house-number"
                                            name="house-number"
                                            placeholder="Ej. B-12"
                                            value={house}
                                            onChange={(e) => setHouse(e.target.value)}
                                            required
                                            type="text"
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label} htmlFor="people-count">
                                            # de personas que ingresan
                                        </label>
                                        <input
                                            className={styles.input}
                                            id="people-count"
                                            min="1"
                                            name="people-count"
                                            value={peopleCount}
                                            onChange={(e) => setPeopleCount(Number(e.target.value))}
                                            required
                                            type="number"
                                        />
                                    </div>
                                </div>

                                <div className={styles.gridTwo}>
                                    <div>
                                        <label className={styles.label} htmlFor="entry-datetime">
                                            Fecha y Hora de Ingreso
                                        </label>
                                        <input
                                            className={styles.input}
                                            id="entry-datetime"
                                            name="entry-datetime"
                                            value={entryDatetime}
                                            onChange={(e) => setEntryDatetime(e.target.value)}
                                            type="datetime-local"
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label} htmlFor="exit-datetime">
                                            Fecha y Hora de Salida
                                        </label>
                                        <input
                                            className={styles.input}
                                            id="exit-datetime"
                                            name="exit-datetime"
                                            value={exitDatetime}
                                            onChange={(e) => setExitDatetime(e.target.value)}
                                            type="datetime-local"
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
                                                    name="has-vehicle"
                                                    value="si"
                                                    checked={hasVehicle === 'si'}
                                                    onChange={() => setHasVehicle('si')}
                                                />
                                                <span>Sí</span>
                                            </label>
                                            <label className={styles.radioLabel}>
                                                <input
                                                    type="radio"
                                                    name="has-vehicle"
                                                    value="no"
                                                    checked={hasVehicle === 'no'}
                                                    onChange={() => setHasVehicle('no')}
                                                />
                                                <span>No</span>
                                            </label>
                                        </div>
                                    </div>

                                    {hasVehicle === 'si' && (
                                        <div className={styles.plateField}>
                                            <label className={styles.label} htmlFor="plate-number">Placa</label>
                                            <input
                                                className={`${styles.input} ${styles.inputUppercase}`}
                                                id="plate-number"
                                                name="plate-number"
                                                placeholder="ABC-123"
                                                value={plate}
                                                onChange={(e) => setPlate(e.target.value)}
                                                type="text"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.submitRow}>
                                    <button className={styles.submitButton} type="submit">
                                        <span className="material-symbols-outlined">qr_code_2</span>
                                        <span>Generar Código QR</span>
                                    </button>
                                </div>
                            </fieldset>
                        </form>
                    </section>

                    {/* Right Column: Active Pass Preview */}
                    <section className={styles.previewPanel}>
                        <div className={styles.previewHeader}>
                            <h3 className={styles.panelTitle}>Pase Activo</h3>
                            <span className={styles.statusBadge}>
                                <span className={styles.statusDot} />
                                {activePass.status}
                            </span>
                        </div>

                        <div className={styles.qrWrapper}>
                            <img
                                alt="Código QR"
                                className={styles.qrImage}
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuApQn7R4DPUN1uLcFi38I0inGw2yyHWhSodo2mT-VnwhNcoEVM5LdJckdxzz_i5aPsKdOLKunMMhVS7zLjxyZbAhPz_H28W1AnFnFi_fHM7oRSWxX5AMHX9d7OdPsZw2JPfS3X6pvk1vU3AX0wn4j2f3_E-COYyEdJIRN_jfzjKr2Hj7xbMHmkzBobCdPhqFHPt6LX0ujNO0JuQUOCW-wPyM4x3RSG0WiRR4hIbtbqCM7cdm_hNjJ-cqgyTwoiWdxdv_K4OMvDpM1g"
                            />
                        </div>

                        <div className={styles.detailsBox}>
                            <div className={styles.detailRow}>
                                <div className={styles.detailLabelGroup}>
                                    <span className="material-symbols-outlined">person</span>
                                    <p className={styles.detailLabel}>Visitante</p>
                                </div>
                                <p className={styles.detailValue}>
                                    {activePass.visitorName} {activePass.visitorLastName}
                                </p>
                            </div>

                            <div className={styles.detailRow}>
                                <div className={styles.detailLabelGroup}>
                                    <span className="material-symbols-outlined">badge</span>
                                    <p className={styles.detailLabel}>CI/Cédula</p>
                                </div>
                                <p className={styles.detailValue}>{activePass.visitorDoc}</p>
                            </div>

                            <div className={styles.detailRow}>
                                <div className={styles.detailLabelGroup}>
                                    <span className="material-symbols-outlined">event</span>
                                    <p className={styles.detailLabel}>Válido para</p>
                                </div>
                                <p className={styles.detailValue}>
                                    {activePass.entryTime} - {activePass.exitTime}
                                </p>
                            </div>

                            <div className={styles.detailRow}>
                                <div className={styles.detailLabelGroup}>
                                    <span className="material-symbols-outlined">home_pin</span>
                                    <p className={styles.detailLabel}>Destino</p>
                                </div>
                                <p className={styles.detailValue}>{activePass.houseNumber}</p>
                            </div>

                            <div className={`${styles.detailRow} ${styles.detailRowLast}`}>
                                <div className={styles.detailLabelGroup}>
                                    <span className="material-symbols-outlined">directions_car</span>
                                    <p className={styles.detailLabel}>Vehículo</p>
                                </div>
                                <p className={styles.detailValue}>
                                    {activePass.hasVehicle === 'si' ? `Sí (${activePass.plateNumber})` : 'No'}
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
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default GeneratePass;