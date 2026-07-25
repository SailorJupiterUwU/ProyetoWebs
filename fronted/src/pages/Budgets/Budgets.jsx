import React, { useState } from 'react';
import usePresupuesto from '../../hooks/usePresupuesto';
import useRubros from '../../hooks/useRubros';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';
import styles from './Budgets.module.css';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

const Budgets = () => {
  const {
    anio,
    setAnio,
    presupuestoActual,
    rubros,
    totales,
    loading,
    error,
    uploadBudget,
    agregarRubro,
    editarMontoRubro
  } = usePresupuesto();
  const { data: catalogoRubros } = useRubros();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const [editingRubro, setEditingRubro] = useState(null);
  const [editMonto, setEditMonto] = useState('');
  const [editError, setEditError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRubroId, setSelectedRubroId] = useState('');
  const [montoAsignado, setMontoAsignado] = useState('');
  const [modalError, setModalError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    const result = await uploadBudget(selectedFile);
    setIsImporting(false);
    if (result.success) {
      alert(`Presupuesto importado: ${result.rubros_creados} rubros creados.`);
      setSelectedFile(null);
    } else {
      alert(result.error);
    }
  };

  const handleAddRubro = async (e) => {
    e.preventDefault();
    setModalError(null);
    const result = await agregarRubro(Number(selectedRubroId), parseFloat(montoAsignado));
    if (result.success) {
      setShowAddModal(false);
      setSelectedRubroId('');
      setMontoAsignado('');
    } else {
      setModalError(result.error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    const result = await editarMontoRubro(editingRubro.id_rubro, parseFloat(editMonto));
    if (result.success) {
      setEditingRubro(null);
      setEditMonto('');
    } else {
      setEditError(result.error);
    }
  };

  return (
    <Layout>
      {/* Import Card */}
      <div className={styles.importCard}>
        <h3 className={styles.cardTitle}>Importar Presupuesto Base</h3>

        <label htmlFor="budgetFile" className={styles.uploadArea}>
          <input
            type="file"
            id="budgetFile"
            className={styles.fileInput}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
          />
          <div className={styles.uploadIcon}>
            <span className="material-symbols-outlined">cloud_upload</span>
          </div>
          <p className={styles.uploadText}>
            {selectedFile
              ? `Archivo seleccionado: ${selectedFile.name}`
              : 'Arrastra tu archivo Excel (.xlsx, .xls) o haz clic para subir'}
          </p>
          <p className={styles.uploadHint}>Se importará para el año {anio} · Tamaño máximo: 10MB</p>

          <Button
            type="button"
            variant="outline"
            disabled={!selectedFile}
            loading={isImporting}
            onClick={(e) => {
              e.preventDefault();
              handleUpload();
            }}
          >
            Importar Datos
          </Button>
        </label>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Presupuesto Operativo</h2>
          <p className={styles.subtitle}>Gestión detallada de rubros y asignaciones.</p>
        </div>
        <div className={styles.headerActions}>
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className={styles.yearSelect}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            disabled={!presupuestoActual}
            title={!presupuestoActual ? `No hay presupuesto creado para ${anio}` : ''}
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo Rubro
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : !presupuestoActual ? (
        <div className={styles.emptyState}>
          No existe un presupuesto creado para el año {anio}. Impórtalo desde el panel de arriba.
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Categoría/Rubro</th>
                <th className={styles.textRight}>Monto Asignado</th>
                <th className={styles.textRight}>Gasto Ejecutado</th>
                <th className={styles.textRight}>Saldo Disponible</th>
                <th className={styles.textCenter}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rubros.length > 0 ? (
                rubros.map((r) => (
                  <tr key={r.id_rubro}>
                    <td className={styles.codeCell}>{r.codigo}</td>
                    <td className={styles.categoryCell}>{r.nombre}</td>
                    <td className={styles.textRight}>{formatPrice(r.monto_asignado)}</td>
                    <td className={`${styles.textRight} ${styles.spentCell}`}>
                      {formatPrice(r.gasto_ejecutado)}
                    </td>
                    <td className={`${styles.textRight} ${styles.bold}`}>
                      {formatPrice(r.saldo_disponible)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.iconButton}
                        title="Editar"
                        onClick={() => {
                          setEditingRubro(r);
                          setEditMonto(String(r.monto_asignado));
                        }}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className={styles.iconButton} title="Ver">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    No hay rubros asignados a este presupuesto todavía
                  </td>
                </tr>
              )}
            </tbody>
            {rubros.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="2" className={styles.totalsLabel}>Totales:</td>
                  <td className={styles.textRight}>{formatPrice(totales.monto_asignado)}</td>
                  <td className={`${styles.textRight} ${styles.spentCell}`}>
                    {formatPrice(totales.gasto_ejecutado)}
                  </td>
                  <td className={`${styles.textRight} ${styles.bold}`}>
                    {formatPrice(totales.saldo_disponible)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Modal Nuevo Rubro */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Asignar Rubro al Presupuesto {anio}</h3>
              <button onClick={() => setShowAddModal(false)} className={styles.modalCloseButton}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRubro} className={styles.form}>
              {modalError && <div className={styles.formErrorAlert}>{modalError}</div>}

              <div className={styles.formGroup}>
                <label>Rubro</label>
                <select
                  value={selectedRubroId}
                  onChange={(e) => setSelectedRubroId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un rubro del catálogo...</option>
                  {catalogoRubros.map((r) => (
                    <option key={r.id_rubro} value={r.id_rubro}>
                      {r.codigo} — {r.nombre} ({r.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Monto Asignado ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoAsignado}
                  onChange={(e) => setMontoAsignado(e.target.value)}
                  placeholder="5000.00"
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Asignar Rubro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRubro && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Monto — {editingRubro.nombre}</h3>
              <button
                onClick={() => {
                  setEditingRubro(null);
                  setEditError(null);
                }}
                className={styles.modalCloseButton}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.form}>
              {editError && <div className={styles.formErrorAlert}>{editError}</div>}

              <div className={styles.formGroup}>
                <label>Código</label>
                <input type="text" value={editingRubro.codigo} disabled />
              </div>

              <div className={styles.formGroup}>
                <label>Nuevo Monto Asignado ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editMonto}
                  onChange={(e) => setEditMonto(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRubro(null);
                    setEditError(null);
                  }}
                  className={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Budgets;