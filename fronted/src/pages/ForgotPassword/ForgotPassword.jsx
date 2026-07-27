import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/endpoints';
import Button from '../../components/comunes/Button/Button';
import Input from '../../components/comunes/Input/Input';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!correo) {
      setCorreoError('El correo es requerido');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        correo_login: correo,
      });

      if (data.token) {
        navigate(`/reset-password?token=${encodeURIComponent(data.token)}`);
      } else {
        // Correo no registrado — no revelamos cuál es el motivo
        setErrorMsg('No se encontró una cuenta con ese correo.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.msg || 'Error al procesar la solicitud. Intente de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

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
          <div className={styles.iconWrap}>
            <span className={`material-symbols-outlined ${styles.lockIcon}`}>lock_reset</span>
          </div>
          <h2 className={styles.title}>Recuperar Contraseña</h2>
          <p className={styles.subtitle}>
            Ingresa tu correo registrado y te proporcionaremos un token para restablecer tu
            contraseña.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

            <Input
              label="Correo electrónico"
              name="correo"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (correoError) setCorreoError('');
              }}
              placeholder="correo@ejemplo.com"
              error={correoError}
              icon="mail"
              required
            />

            <Button type="submit" loading={loading} fullWidth icon="arrow_forward" iconPosition="right">
              Obtener Token
            </Button>
          </form>

          <div className={styles.footer}>
            <Link to="/login" className={styles.backLink}>
              <span className="material-symbols-outlined">arrow_back</span>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
