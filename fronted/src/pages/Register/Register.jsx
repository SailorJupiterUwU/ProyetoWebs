import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/comunes/Button/Button';
import Input from '../../components/comunes/Input/Input';
import useAuth from '../../hooks/useAuth';
import { isValidPassword, isValidEmail, isValidCedula } from '../../utils/validations';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    ci_ruc: '',
    casa: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [fotoFile, setFotoFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const { registro, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFileName(file.name);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.nombres) errors.nombres = 'Requerido';
    if (!formData.apellidos) errors.apellidos = 'Requerido';
    if (!isValidCedula(formData.ci_ruc)) errors.ci_ruc = 'CI/RUC inválido';
    if (!formData.casa) errors.casa = 'Requerido';
    if (!isValidEmail(formData.correo)) errors.correo = 'Correo inválido';
    if (!isValidPassword(formData.password)) {
      errors.password = 'Mínimo 8 caracteres, una mayúscula y un número';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await registro({
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      ci_ruc: formData.ci_ruc,
      numero_vivienda: formData.casa,
      correo_login: formData.correo,
      password: formData.password,
      foto: fotoFile,
    });

    if (result.success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successBlock}>
            <span className={`material-symbols-outlined ${styles.successIcon}`}>
              check_circle
            </span>
            <h2 className={styles.title}>¡Solicitud Enviada!</h2>
            <p className={styles.subtitle}>
              Tu solicitud fue enviada correctamente. La directiva revisará tu
              acceso y te notificaremos por correo.
            </p>
            <Button onClick={() => navigate('/login')} fullWidth>
              Ir al Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            shield_person
          </span>
          <h2 className={styles.title}>Registro de Usuario</h2>
          <p className={styles.subtitle}>
            Ingrese sus datos para generar la solicitud. La directiva
            verificará su estado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.row}>
            <Input
              label="Nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ej: Juan Pablo"
              icon="person"
              error={formErrors.nombres}
              required
            />
            <Input
              label="Apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ej: Pérez Gómez"
              icon="person"
              error={formErrors.apellidos}
              required
            />
          </div>

          <div className={styles.row}>
            <Input
              label="CI/RUC"
              name="ci_ruc"
              value={formData.ci_ruc}
              onChange={handleChange}
              placeholder="Ej: 17XXXXXXXX"
              icon="badge"
              error={formErrors.ci_ruc}
              required
            />
            <Input
              label="#Casa"
              name="casa"
              value={formData.casa}
              onChange={handleChange}
              placeholder="Ej: A-12"
              icon="home"
              error={formErrors.casa}
              required
            />
          </div>

          <Input
            label="Correo electrónico"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            icon="mail"
            error={formErrors.correo}
            required
          />

          <div className={styles.row}>
            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon="lock"
              error={formErrors.password}
              required
            />
            <Input
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon="lock"
              error={formErrors.confirmPassword}
              required
            />
          </div>

          <label htmlFor="fotoFile" className={styles.uploadArea}>
            <input
              type="file"
              id="fotoFile"
              className={styles.fileInput}
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <div className={styles.uploadIcon}>
              <span className="material-symbols-outlined">cloud_upload</span>
            </div>
            <span className={styles.uploadLabel}>
              {fileName ? `Archivo: ${fileName}` : 'Subir Foto (Opcional)'}
            </span>
            <span className={styles.uploadHint}>PNG, JPG o PDF hasta 5MB</span>
          </label>

          <Button
            type="submit"
            loading={loading}
            fullWidth
            icon="arrow_forward"
            iconPosition="right"
          >
            Enviar Solicitud
          </Button>
        </form>

        <div className={styles.footer}>
          <span>¿Ya tienes cuenta? </span>
          <Link to="/login" className={styles.loginLink}>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;