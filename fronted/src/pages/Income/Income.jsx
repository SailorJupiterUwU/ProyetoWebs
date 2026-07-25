import React, { useState } from 'react';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import useIngresos from '../../hooks/useIngresos';
import useViviendas from '../../hooks/useViviendas';
import useDeudaVivienda from '../../hooks/useDeudaVivienda';
import { formatPrice, formatDate } from '../../utils/helpers';
import styles from './Income.module.css';

const Income = () => {
  const { data: ingresos, total, resumen, distribucion, loading, error, crearIngreso } = useIngresos();
  const { data: viviendas } = useViviendas();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVivienda, setSelectedVivienda] = useState('');
  const [tipoPago, setTipoPago] = useState('alicuota'); // 'alicuota' | 'multa'
  const [selectedDeudaId, setSelectedDeudaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [comprobanteNombre, setComprobanteNombre] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { alicuotas, multas, loading: loadingDeuda } = useDeudaVivienda(selectedVivienda);

  const deudaOptions = tipoPago === 'alicuota' ? alicuotas : multas;

  const resetForm = () => {
    setSelectedVivienda('');
    setTipoPago('alicuota');
    setSelectedDeudaId('');
    setDescripcion('');
    setComprobante(null);
    setComprobanteNombre(null);
    setFormError(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
      setComprobanteNombre(e.target.files[0].name);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedDeudaId) {
      setFormError('Selecciona una alícuota o multa pendiente.');
      return;
    }

    setSubmitting(true);
    const result = await crearIngreso({
      id_vivienda: Number(selectedVivienda),
      id_alicuota: tipoPago === 'alicuota' ? Number(selectedDeudaId) : undefined,
      id_multa: tipoPago === 'multa' ? Number(selectedDeudaId) : undefined,
      descripcion,
      comprobante,
    });
    setSubmitting(false);

    if (result.success) {
      setShowAddModal(false);
      resetForm();
    } else {
      setFormError(result.error);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <PageHeader
          breadcrumbs={['Finanzas', 'Ingresos']}
          title="Registro de Ingresos"
          action={
            <Button variant="primary" onClick={() => setShowAddModal(true)} icon="add" iconPosition="left">
              Nuevo Ingreso
            </Button>
          }
        />

        {/* Summary Cards */}
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardLabel}>INGRESOS DEL MES</span>
              <div className={`${styles.cardIcon} ${styles.cardIconOrange}`}>
                <span className="material-symbols-outlined">account_balance</span>
              </div>
            </div>
            <div className={styles.cardBottom}>
              <span className={styles.cardValue}>{formatPrice(resumen.ingresos_del_mes)}</span>
              <div className={styles.cardTrendUp}>
                <span className="material-symbols-outlined">trending_up</span>
                <span>{resumen.variacion_pct >= 0 ? '+' : ''}{resumen.variacion_pct}% vs mes anterior</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardLabel}>PENDIENTES DE COBRO</span>
              <div className={`${styles.cardIcon} ${styles.cardIconGray}`}>
                <span className="material-symbols-outlined">hourglass_empty</span>
              </div>
            </div>
            <div className={styles.cardBottom}>
              <span className={styles.cardValue}>{formatPrice(resumen.pendientes_cobro)}</span>
              <p className={styles.cardNote}>{resumen.recibos_pendientes} recibos pendientes</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardLabel}>MULTAS RECAUDADAS</span>
              <div className={`${styles.cardIcon} ${styles.cardIconRed}`}>
                <span className="material-symbols-outlined">gavel</span>
              </div>
            </div>
            <div className={styles.cardBottom}>
              <span className={styles.cardValue}>{formatPrice(resumen.multas_recaudadas)}</span>
              <p className={styles.cardNote}>Acumulado del periodo</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className={styles.errorAlert}>{error}</div>
        ) : (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.theadRow}>
                    <th className={styles.th}>FECHA</th>
                    <th className={styles.th}>CASA</th>
                    <th className={styles.th}>RESIDENTE</th>
                    <th className={styles.th}>CONCEPTO</th>
                    <th className={styles.th}>MONTO</th>
                    <th className={styles.th}>Nº DOCUMENTO</th>
                    <th className={styles.th}>ESTADO</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {ingresos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyCell}>
                        No hay ingresos registrados.
                      </td>
                    </tr>
                  ) : (
                    ingresos.map((row, idx) => (
                      <tr key={row.id_ingreso} className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}>
                        <td className={styles.dateCell}>{formatDate(row.fecha_pago)}</td>
                        <td className={styles.houseCell}>{row.numero_vivienda}</td>
                        <td className={styles.residentCell}>{row.residente_nombre}</td>
                        <td className={styles.conceptCell}>{row.descripcion}</td>
                        <td className={styles.amountCell}>{formatPrice(row.total_pagado)}</td>
                        <td className={styles.docCell}>{row.num_documento}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              row.estado === 'Pagado' ? styles.statusPaid : styles.statusPending
                            }`}
                          >
                            {row.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span>Mostrando {ingresos.length} de {total} registros</span>
            </div>
          </div>
        )}

        {/* Distribution */}
        {distribucion.length > 0 && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Distribución por Concepto</h3>
            <div className={styles.barTrack}>
              {distribucion.map((d, idx) => (
                <div
                  key={d.concepto}
                  className={styles.barSegment}
                  style={{
                    width: `${d.porcentaje}%`,
                    backgroundColor: ['#f97316', '#505f76', '#584237'][idx % 3],
                  }}
                />
              ))}
            </div>
            <div className={styles.legendGrid}>
              {distribucion.map((d) => (
                <div key={d.concepto} className={styles.legendItem}>
                  <span className={styles.legendLabel}>{d.concepto}</span>
                  <span className={styles.legendValue}>{d.porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo Ingreso */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Registrar Nuevo Ingreso</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className={styles.modalCloseButton}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className={styles.form}>
              {formError && <div className={styles.formErrorAlert}>{formError}</div>}

              <div className={styles.formField}>
                <label className={styles.formLabel}>Vivienda</label>
                <select
                  value={selectedVivienda}
                  onChange={(e) => {
                    setSelectedVivienda(e.target.value);
                    setSelectedDeudaId('');
                  }}
                  className={styles.formInput}
                  required
                >
                  <option value="">Selecciona una vivienda...</option>
                  {viviendas.map((v) => (
                    <option key={v.id_vivienda} value={v.id_vivienda}>
                      Casa {v.numero}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVivienda && (
                <>
                  <div className={styles.tipoPagoTabs}>
                    <button
                      type="button"
                      className={tipoPago === 'alicuota' ? styles.tipoTabActive : styles.tipoTab}
                      onClick={() => {
                        setTipoPago('alicuota');
                        setSelectedDeudaId('');
                      }}
                    >
                      Alícuota ({alicuotas.length})
                    </button>
                    <button
                      type="button"
                      className={tipoPago === 'multa' ? styles.tipoTabActive : styles.tipoTab}
                      onClick={() => {
                        setTipoPago('multa');
                        setSelectedDeudaId('');
                      }}
                    >
                      Multa ({multas.length})
                    </button>
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>
                      {tipoPago === 'alicuota' ? 'Alícuota Pendiente' : 'Multa Pendiente'}
                    </label>
                    {loadingDeuda ? (
                      <LoadingSpinner />
                    ) : deudaOptions.length === 0 ? (
                      <p className={styles.noDeuda}>
                        Esta vivienda no tiene {tipoPago === 'alicuota' ? 'alícuotas' : 'multas'} pendientes.
                      </p>
                    ) : (
                      <select
                        value={selectedDeudaId}
                        onChange={(e) => setSelectedDeudaId(e.target.value)}
                        className={styles.formInput}
                        required
                      >
                        <option value="">Selecciona...</option>
                        {tipoPago === 'alicuota'
                          ? alicuotas.map((a) => (
                              <option key={a.id_alicuota} value={a.id_alicuota}>
                                {a.mes}/{a.anio} — {formatPrice(a.valor_base)}
                              </option>
                            ))
                          : multas.map((m) => (
                              <option key={m.id_multa} value={m.id_multa}>
                                {m.dias_atraso} días de atraso — {formatPrice(m.valor)}
                              </option>
                            ))}
                      </select>
                    )}
                  </div>
                </>
              )}

              <div className={styles.formField}>
                <label className={styles.formLabel}>Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Pago cuota mantenimiento junio"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Comprobante (opcional)</label>
                <label htmlFor="comprobanteFile" className={styles.fileUploadArea}>
                  <input
                    type="file"
                    id="comprobanteFile"
                    className={styles.fileInput}
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <span className="material-symbols-outlined">upload_file</span>
                  <span>{comprobanteNombre || 'Subir comprobante'}</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Income;