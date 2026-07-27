import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/endpoints';
import Button from '../../components/comunes/Button/Button';
import Input from '../../components/comunes/Input/Input';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({ nueva_password: '', confirmar_password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errors = {};

    if (!formData.nueva_password) errors.nueva_password = 'La nueva contraseña es requerida';
    else if (formData.nueva_password.length < 6)
      errors.nueva_password = 'Debe tener al menos 6 caracteres';

    if (!formData.confirmar_password)
      errors.confirmar_password = 'Confirma tu contraseña';
    else if (formData.nueva_password !== formData.confirmar_password)
      errors.confirmar_password = 'Las contraseñas no coinciden';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!token) {
      setErrorMsg('Token inválido. Solicita un nuevo enlace de recuperación.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        nueva_password: formData.nueva_password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.msg || 'Token inválido o expirado. Solicita uno nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.rightSide}>
          <div className={styles.formCard}>
            <div className={`${styles.iconWrap} ${styles.errorIcon}`}>
              <span className="material-symbols-outlined">error</span>
            </div>
            <h2 className={styles.title}>Token no válido</h2>
            <p className={styles.subtitle}>
              No se encontró un token de recuperación. Solicita uno nuevo desde la página de
              recuperación de contraseña.
            </p>
            <Link to="/forgot-password" className={styles.backLink}>
              <span className="material-symbols-outlined">arrow_back</span>
              Recuperar contraseña
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <div className={styles.leftOverlay} />
        <div className={styles.brandContainer}>
          <span className={`material-symbols-outlined ${styles.brandIcon}`}>domain</span>
          <h1 className={styles.brandName}>CondoSecure Manager</h1>
          <p className={styles.brandTagline}>
            Sistema Web para Gestión Administrativa, Financiera y de Seguridad de un
            Conjunto Habitacional
          </p>
        </div>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.formCard}>
          {success ? (
            <div className={styles.successState}>
              <div className={`${styles.iconWrap} ${styles.successIcon}`}>
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h2 className={styles.title}>¡Contraseña actualizada!</h2>
              <p className={styles.subtitle}>
                Tu contraseña fue restablecida correctamente. Serás redirigido al inicio de
                sesión en unos segundos...
              </p>
              <Link to="/login" className={styles.backLink}>
                <span className="material-symbols-outlined">arrow_forward</span>
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.iconWrap}>
                <span className={`material-symbols-outlined ${styles.lockIcon}`}>
                  key
                </span>
              </div>
              <h2 className={styles.title}>Nueva Contraseña</h2>
              <p className={styles.subtitle}>
                Ingresa y confirma tu nueva contraseña para restablecer el acceso.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

                <Input
                  label="Nueva contraseña"
                  name="nueva_password"
                  type="password"
                  value={formData.nueva_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={formErrors.nueva_password}
                  icon="lock"
                  required
                />

                <Input
                  label="Confirmar contraseña"
                  name="confirmar_password"
                  type="password"
                  value={formData.confirmar_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={formErrors.confirmar_password}
                  icon="lock_clock"
                  required
                />

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  icon="arrow_forward"
                  iconPosition="right"
                >
                  Restablecer Contraseña
                </Button>
              </form>

              <div className={styles.footer}>
                <Link to="/login" className={styles.backLink}>
                  <span className="material-symbols-outlined">arrow_back</span>
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
