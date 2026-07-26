import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import useQr from '../../../hooks/useQr';
import Layout from '../../../components/comunes/Layout/Layout';
import PageHeader from '../../../components/comunes/PageHeader/PageHeader';
import styles from './Scanner.module.css';

const QR_REGION_ID = 'qr-camera-region';

const Scanner = () => {
  const navigate = useNavigate();
  const { validar, registrarIngreso, registrarSalida, revocar, validando, procesando } = useQr();

  const [scanResult, setScanResult] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const html5QrRef = useRef(null);
  const processingRef = useRef(false); // evita procesar el mismo QR varias veces mientras se decide qué hacer

  const handleValidarCodigo = useCallback(
    async (codigo) => {
      if (processingRef.current) return;
      processingRef.current = true;

      const result = await validar(codigo);
      setScanResult(result);
      setActionMsg(null);

      // Detenemos la cámara tras un escaneo exitoso para no seguir leyendo el mismo QR en bucle
      if (html5QrRef.current) {
        try {
          await html5QrRef.current.stop();
        } catch (e) {
          // ya estaba detenida
        }
        setCameraActive(false);
      }

      processingRef.current = false;
    },
    [validar]
  );

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (e) {
        // ignorar si ya estaba detenida
      }
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!cameraActive) return;

    const qrCode = new Html5Qrcode(QR_REGION_ID);
    html5QrRef.current = qrCode;

    qrCode
      .start(
        { facingMode: 'user' }, // cámara frontal del laptop; usa 'environment' si prefieres la trasera en móviles
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleValidarCodigo(decodedText);
        },
        () => {
          // callback de "no se detectó QR en este frame" — se ignora, se llama constantemente
        }
      )
      .catch((err) => {
        console.error('Error al iniciar la cámara:', err);
        setCameraError(
          err?.message?.includes('Permission')
            ? 'Permiso de cámara denegado. Habilítalo en la configuración del navegador.'
            : 'No se pudo acceder a la cámara. Verifica que esté disponible y no esté en uso por otra app.'
        );
        setCameraActive(false);
      });

    return () => {
      (async () => {
        const instance = html5QrRef.current;
        html5QrRef.current = null; // evita que otra ejecución concurrente vuelva a intentar detener la misma instancia

        if (!instance) return;

        try {
          // getState() existe en versiones recientes de html5-qrcode; si la tuya no lo tiene, el try/catch de abajo sigue protegiendo
          const state = instance.getState?.();
          const isRunning = state === undefined || state === 2 /* SCANNING */ || state === 3 /* PAUSED */;
          if (isRunning) {
            await instance.stop();
          }
          instance.clear();
        } catch (e) {
          // Silenciamos: puede que ya estuviera detenido o el DOM ya se haya desmontado
        }
      })();
    };
  }, [cameraActive, handleValidarCodigo]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    await handleValidarCodigo(manualCode.trim());
    setShowManualModal(false);
    setManualCode('');
  };

  const qrId = scanResult?.visitante?.id_qr;

  const handleAction = async (action) => {
    if (!qrId) return;
    let result;
    if (action === 'ingreso') result = await registrarIngreso(qrId);
    if (action === 'salida') result = await registrarSalida(qrId);
    if (action === 'revocar') result = await revocar(qrId);

    if (result.success) {
      setActionMsg({
        type: 'success',
        text: `${action === 'ingreso' ? 'Ingreso' : action === 'salida' ? 'Salida' : 'QR revocado'} registrado correctamente.`,
      });
    } else {
      setActionMsg({ type: 'error', text: result.error });
    }
  };

  const handleScanAnother = () => {
    setScanResult(null);
    setActionMsg(null);
    startCamera();
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

            {cameraActive ? (
              <div id={QR_REGION_ID} className={styles.cameraRegion} />
            ) : (
              <div className={styles.cameraPlaceholder}>
                <span className={`material-symbols-outlined ${styles.scanIcon}`}>
                  qr_code_scanner
                </span>
              </div>
            )}

            {cameraError && <p className={styles.cameraErrorText}>{cameraError}</p>}

            <div className={styles.waitingBlock}>
              {!cameraActive ? (
                <button onClick={startCamera} className={styles.startCameraButton}>
                  <span className="material-symbols-outlined">videocam</span>
                  Activar Cámara
                </button>
              ) : (
                <button onClick={stopCamera} className={styles.stopCameraButton}>
                  <span className="material-symbols-outlined">videocam_off</span>
                  Detener Cámara
                </button>
              )}

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

                  <button onClick={handleScanAnother} className={styles.scanAnotherButton}>
                    <span className="material-symbols-outlined">qr_code_scanner</span>
                    Escanear otro código
                  </button>
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