import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/comunes/Layout/Layout';
import PageHeader from '../../../components/comunes/PageHeader/PageHeader';
import styles from './Scanner.module.css';

const initialScanResult = {
  visitorName: '—',
  doc: '—',
  peopleCount: 0,
  validTime: '—',
  destinationHouse: '—',
  destinationResident: '—',
  vehicle: '—',
  isValid: true,
};

const Scanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(initialScanResult);
  const [isScanning, setIsScanning] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const triggerValidScan = () => {
    setIsScanning(false);
    setScanResult({
      visitorName: 'Carlos Mendoza',
      doc: '1712345678',
      peopleCount: 1,
      validTime: 'Hoy, 15:00 - 18:00',
      destinationHouse: 'Casa A-01',
      destinationResident: 'Cynthia Artieda',
      vehicle: 'Sí (Placa: ABC-123)',
      isValid: true,
    });
    setTimeout(() => setIsScanning(true), 4000);
  };

  const triggerInvalidScan = () => {
    setIsScanning(false);
    setScanResult({
      visitorName: 'Desconocido / Expirado',
      doc: '9999999999',
      peopleCount: 0,
      validTime: 'Expiró a las 12:00',
      destinationHouse: 'Sin registro',
      destinationResident: 'N/A',
      vehicle: 'No registrado',
      isValid: false,
    });
    setTimeout(() => setIsScanning(true), 4000);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim().toLowerCase() === 'expirado' || manualCode === '000') {
      triggerInvalidScan();
    } else {
      triggerValidScan();
    }
    setShowManualModal(false);
    setManualCode('');
  };

  return (
    <Layout>
      <div className={styles.container}>
        <PageHeader
          breadcrumbs={['Seguridad QR', 'Escáner']}
          title="Garita Principal - Control de Acceso"
        />
        {/* Simulation Toolbar for Testing — quitar cuando conectemos el backend */}
        <div className={styles.simToolbar}>
          <div className={styles.simStatus}>
            <span className={styles.simDot} />
            <span>Cámara Garita: ONLINE</span>
          </div>
          <div className={styles.simActions}>
            <span className={styles.simLabel}>Probar Simulador:</span>
            <button onClick={triggerValidScan} className={styles.simButtonValid}>
              Escaneo VÁLIDO
            </button>
            <button onClick={triggerInvalidScan} className={styles.simButtonInvalid}>
              Escaneo INVÁLIDO
            </button>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Lector de Código */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Lector de Código</h3>

            <div className={styles.cameraViewport}>
              <div className={styles.viewportGradient} />

              <div className={styles.scanFrame}>
                <div className={`${styles.corner} ${styles.cornerTL}`} />
                <div className={`${styles.corner} ${styles.cornerTR}`} />
                <div className={`${styles.corner} ${styles.cornerBL}`} />
                <div className={`${styles.corner} ${styles.cornerBR}`} />

                {isScanning && <div className={styles.scanLaser} />}

                <span className={`material-symbols-outlined ${styles.scanIcon}`}>
                  qr_code_scanner
                </span>
              </div>
            </div>

            <div className={styles.waitingBlock}>
              <p className={styles.waitingText}>
                <span className={`material-symbols-outlined ${styles.spinIcon}`}>
                  progress_activity
                </span>
                Esperando código QR...
              </p>

              <button onClick={() => setShowManualModal(true)} className={styles.manualLink}>
                Ingresar código manualmente
              </button>
            </div>
          </div>

          {/* Resultado de Validación */}
          <div className={styles.card}>
            <div
              className={`${styles.glow} ${scanResult.isValid ? styles.glowValid : styles.glowInvalid
                }`}
            />

            <h3 className={styles.cardTitle}>Resultado de Validación</h3>

            <div className={styles.resultBody}>
              {scanResult.isValid ? (
                <div className={styles.statusBlock}>
                  <div className={`${styles.statusIconWrap} ${styles.statusIconValid}`}>
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <h2 className={`${styles.statusHeading} ${styles.statusHeadingValid}`}>
                    VÁLIDO
                  </h2>
                  <p className={`${styles.statusSub} ${styles.statusSubValid}`}>
                    ACCESO PERMITIDO
                  </p>
                </div>
              ) : (
                <div className={styles.statusBlock}>
                  <div className={`${styles.statusIconWrap} ${styles.statusIconInvalid}`}>
                    <span className="material-symbols-outlined">cancel</span>
                  </div>
                  <h2 className={`${styles.statusHeading} ${styles.statusHeadingInvalid}`}>
                    NO VÁLIDO
                  </h2>
                  <p className={`${styles.statusSub} ${styles.statusSubInvalid}`}>
                    ACCESO DENEGADO
                  </p>
                </div>
              )}

              <div className={styles.dataModule}>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>VISITANTE</span>
                  <span className={styles.dataValueLg}>{scanResult.visitorName}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>CI/CÉDULA</span>
                  <span className={styles.dataValueMono}>{scanResult.doc}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>PERSONAS</span>
                  <span className={styles.dataValue}>{scanResult.peopleCount}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>VÁLIDO PARA</span>
                  <span className={styles.dataValue}>{scanResult.validTime}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>DESTINO</span>
                  <div className={styles.dataValueRight}>
                    <span className={styles.dataValueBlock}>{scanResult.destinationHouse}</span>
                    <span className={styles.dataValueSub}>{scanResult.destinationResident}</span>
                  </div>
                </div>
                <div className={`${styles.dataRow} ${styles.dataRowLast}`}>
                  <span className={styles.dataLabel}>VEHÍCULO</span>
                  <span className={styles.dataValue}>{scanResult.vehicle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.backLinkRow}>
          <button onClick={() => navigate('/seguridad/generar')} className={styles.backLink}>
            <span className="material-symbols-outlined">qr_code_2</span>
            <span>Ir a Generar Pase de Visita</span>
          </button>
        </div>

        {/* Manual Code Modal */}
        {showManualModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Ingreso Manual de Código QR</h3>
                <button onClick={() => setShowManualModal(false)} className={styles.modalCloseButton}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleManualSubmit} className={styles.form}>
                <div>
                  <label className={styles.formLabel}>Código o Cédula del Visitante</label>
                  <input
                    type="text"
                    placeholder="Ej. 1712345678 o pase ID"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                  <p className={styles.formHint}>
                    Tip: Ingresa "1712345678" para pase válido o "expirado" para denegado.
                  </p>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Validar Código
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Scanner;