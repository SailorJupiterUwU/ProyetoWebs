import React, { useState } from 'react';
import useBudgets from '../../hooks/useBudgets';
import Layout from '../../components/comunes/Layout/Layout';
import PageHeader from '../../components/comunes/PageHeader/PageHeader';
import Button from '../../components/comunes/Button/Button';
import LoadingSpinner from '../../components/comunes/LoadingSpinner/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';
import styles from './Budgets.module.css';

const Budgets = () => {
  const { data: budgets, loading, error, uploadBudget } = useBudgets();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [montoAsignado, setMontoAsignado] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    const result = await uploadBudget(selectedFile);
    setIsImporting(false);
    if (result.success) {
      alert('Archivo procesado correctamente');
      setSelectedFile(null);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // TODO: conectar con la función real de creación de rubro (ej. addBudget del hook useBudgets)
    console.warn('addBudget no implementado en useBudgets todavía', {
      categoria,
      assigned: Number(montoAsignado) || 0,
    });
    setIsSaving(false);
    setShowAddModal(false);
    setCategoria('');
    setMontoAsignado('');
  };

  const totalAssigned = budgets.reduce((acc, b) => acc + b.assigned, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalAssigned - totalSpent;

  return (
    <Layout>
      {/* Import Card */}
      <PageHeader
        breadcrumbs={['Presupuesto', 'Operativo']}
        action={
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Nuevo Rubro
          </Button>
        }
      />
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
          <p className={styles.uploadHint}>Tamaño máximo: 10MB</p>

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

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>{error}</div>
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
              {budgets.length > 0 ? (
                budgets.map((b) => {
                  const available = b.assigned - b.spent;
                  return (
                    <tr key={b.id_presupuesto}>
                      <td className={styles.codeCell}>{b.id_presupuesto}</td>
                      <td className={styles.categoryCell}>{b.categoria || 'Rubro General'}</td>
                      <td className={styles.textRight}>{formatPrice(b.assigned)}</td>
                      <td className={`${styles.textRight} ${styles.spentCell}`}>{formatPrice(b.spent)}</td>
                      <td className={`${styles.textRight} ${styles.bold}`}>{formatPrice(available)}</td>
                      <td className={styles.actionsCell}>
                        <button className={styles.iconButton} title="Editar">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className={styles.iconButton} title="Ver">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    No hay datos presupuestarios registrados
                  </td>
                </tr>
              )}
            </tbody>
            {budgets.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="2" className={styles.totalsLabel}>Totales:</td>
                  <td className={styles.textRight}>{formatPrice(totalAssigned)}</td>
                  <td className={`${styles.textRight} ${styles.spentCell}`}>{formatPrice(totalSpent)}</td>
                  <td className={`${styles.textRight} ${styles.bold}`}>{formatPrice(totalRemaining)}</td>
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
              <h3 className={styles.modalTitle}>Nuevo Rubro Presupuestario</h3>
              <button onClick={() => setShowAddModal(false)} className={styles.modalCloseButton}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className={styles.form}>
              <div>
                <label className={styles.formLabel}>Categoría/Rubro</label>
                <input
                  type="text"
                  placeholder="Ej. Mantenimiento Ascensores"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              <div>
                <label className={styles.formLabel}>Monto Asignado</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={montoAsignado}
                  onChange={(e) => setMontoAsignado(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Rubro'}
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