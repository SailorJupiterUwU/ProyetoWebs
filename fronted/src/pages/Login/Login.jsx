import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/comunes/Button/Button';
import Input from '../../components/comunes/Input/Input';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ correo: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.correo) errors.correo = 'El correo es requerido';
    if (!formData.password) errors.password = 'La contraseña es requerida';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await login(formData.correo, formData.password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <div className={styles.leftOverlay} />
        <div className={styles.brandContainer}>
          <span className={`material-symbols-outlined ${styles.brandIcon}`}>
            domain
          </span>
          <h1 className={styles.brandName}>CondoSecure Manager</h1>
          <p className={styles.brandTagline}>
            Sistema Web para Gestión Administrativa, Financiera y de Seguridad
            de un Conjunto Habitacional
          </p>
        </div>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Acceso al Sistema</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <Input
              label="Correo electrónico"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              error={formErrors.correo}
              icon="mail"
              required
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={formErrors.password}
              icon="lock"
              required
            />

            <div className={styles.forgotPassword}>
              <Link to="/forgot-password">¿Olvidó su contraseña?</Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              icon="arrow_forward"
              iconPosition="right"
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className={styles.footer}>
            <span>¿No tienes cuenta? </span>
            <Link to="/register" className={styles.registerLink}>
              Solicitar Registro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;