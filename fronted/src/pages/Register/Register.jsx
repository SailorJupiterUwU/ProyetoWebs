import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/comunes/Button/Button';
import Input from '../../components/comunes/Input/Input';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    ci_ruc: '',
    casa: '',
    correo: '',
  });
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulación de envío de solicitud
    setTimeout(() => {
      setLoading(false);
      alert('Solicitud enviada correctamente. La directiva revisará su acceso.');
      navigate('/login');
    }, 1500);
  };

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
          <div className={styles.row}>
            <Input
              label="Nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ej: Juan Pablo"
              icon="person"
              required
            />
            <Input
              label="Apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ej: Pérez Gómez"
              icon="person"
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
              required
            />
            <Input
              label="#Casa"
              name="casa"
              value={formData.casa}
              onChange={handleChange}
              placeholder="Ej: A-12"
              icon="home"
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
            required
          />

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