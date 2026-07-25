import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQr from '../../../hooks/useQr';
import Layout from '../../../components/comunes/Layout/Layout';
import PageHeader from '../../../components/comunes/PageHeader/PageHeader';
import styles from './Scanner.module.css';

const Scanner = () => {
  const navigate = useNavigate();
  const { validar, registrarIngreso, registrarSalida, revocar, validando, procesando } = useQr();

  const [scanResult, setScanResult] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const result = await validar(manualCode.trim());
    setScanResult(result);
    setActionMsg(null);
    setShowManualModal(false);
    setManualCode('');
  };

  // Asumiendo que el backend incluye un identificador del visitante/QR
  // dentro del objeto `visitante` — ajusta el nombre del campo si difiere.
  const qrId = scanResult?.visitante?.id_visitante;

  const handleAction = async (action) => {
    if (!qrId) return;
    let result;
    if (action === 'ingreso') result = await registrarIngreso(qrId);
    if (action === 'salida') result = await registrarSalida(qrId);
    if (action === 'revocar') result = await revocar(qrId);

    if (result.success) {
      setActionMsg({ type: 'success', text: `${action === 'ingreso' ? 'Ingreso' : action === 'salida' ? 'Salida' : 'QR revocado'} registrado correctamente.` });
    } else {
      setActionMsg({ type: 'error', text: result.error });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <PageHeader
          breadcrumbs={['Seguridad', 'Escáner']}
          title="Garita Principal - Control de Acceso"
        />

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
                {validando && <div className={styles.scanLaser} />}
                <span className={`material-symbols-outlined ${styles.scanIcon}`}>
                  qr_code_scanner
                </span>
              </div>
            </div>

            <div className={styles.waitingBlock}>
              <p className={styles.waitingText}>
                {validando ? 'Validando código...' : 'Esperando código QR...'}
              </p>
              <button onClick={() => setShowManualModal(true)} className={styles.manualLink}>
                Ingresar código manualmente
              </button>
            </div>
          </div>

          {/* Resultado de Validación */}
          <div className={styles.card}>
            {!scanResult ? (
              <div className={styles.resultBody}>
                <p className={styles.waitingText}>Aún no se ha validado ningún código.</p>
              </div>
            ) : (
              <>
                <div
                  className={`${styles.glow} ${scanResult.valido ? styles.glowValid : styles.glowInvalid
                    }`}
                />
                <h3 className={styles.cardTitle}>Resultado de Validación</h3>

                <div className={styles.resultBody}>
                  {scanResult.valido ? (
                    <div className={styles.statusBlock}>
                      <div className={`${styles.statusIconWrap} ${styles.statusIconValid}`}>
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                      <h2 className={`${styles.statusHeading} ${styles.statusHeadingValid}`}>VÁLIDO</h2>
                      <p className={`${styles.statusSub} ${styles.statusSubValid}`}>ACCESO PERMITIDO</p>
                    </div>
                  ) : (
                    <div className={styles.statusBlock}>
                      <div className={`${styles.statusIconWrap} ${styles.statusIconInvalid}`}>
                        <span className="material-symbols-outlined">cancel</span>
                      </div>
                      <h2 className={`${styles.statusHeading} ${styles.statusHeadingInvalid}`}>NO VÁLIDO</h2>
                      <p className={`${styles.statusSub} ${styles.statusSubInvalid}`}>
                        {scanResult.motivo || 'ACCESO DENEGADO'}
                      </p>
                    </div>
                  )}

                  {scanResult.valido && scanResult.visitante && (
                    <div className={styles.dataModule}>
                      <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>VISITANTE</span>
                        <span className={styles.dataValueLg}>
                          {scanResult.visitante.nombre} {scanResult.visitante.apellido}
                        </span>
                      </div>
                      <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>CI/CÉDULA</span>
                        <span className={styles.dataValueMono}>{scanResult.visitante.cedula}</span>
                      </div>
                      <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>PERSONAS</span>
                        <span className={styles.dataValue}>{scanResult.visitante.num_personas}</span>
                      </div>
                      <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>DESTINO</span>
                        <span className={styles.dataValue}>{scanResult.visitante.vivienda_destino}</span>
                      </div>
                      <div className={`${styles.dataRow} ${styles.dataRowLast}`}>
                        <span className={styles.dataLabel}>VEHÍCULO</span>
                        <span className={styles.dataValue}>
                          {scanResult.visitante.tiene_vehiculo
                            ? `Sí (${scanResult.visitante.placa})`
                            : 'No'}
                        </span>
                      </div>
                    </div>
                  )}

                  {scanResult.valido && qrId && (
                    <div className={styles.qrActions}>
                      <button
                        className={styles.ingresoBtn}
                        onClick={() => handleAction('ingreso')}
                        disabled={procesando}
                      >
                        <span className="material-symbols-outlined">login</span>
                        Registrar Ingreso
                      </button>
                      <button
                        className={styles.salidaBtn}
                        onClick={() => handleAction('salida')}
                        disabled={procesando}
                      >
                        <span className="material-symbols-outlined">logout</span>
                        Registrar Salida
                      </button>
                      <button
                        className={styles.revocarBtn}
                        onClick={() => handleAction('revocar')}
                        disabled={procesando}
                      >
                        <span className="material-symbols-outlined">block</span>
                        Revocar
                      </button>
                    </div>
                  )}

                  {actionMsg && (
                    <div
                      className={
                        actionMsg.type === 'success' ? styles.actionMsgSuccess : styles.actionMsgError
                      }
                    >
                      {actionMsg.text}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.backLinkRow}>
          <button onClick={() => navigate('/seguridad/generar')} className={styles.backLink}>
            <span className="material-symbols-outlined">qr_code_2</span>
            <span>Ir a Generar Pase de Visita</span>
          </button>
        </div>

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
                  <label className={styles.formLabel}>Código del Visitante</label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles.submitButton} disabled={validando}>
                    {validando ? 'Validando...' : 'Validar Código'}
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