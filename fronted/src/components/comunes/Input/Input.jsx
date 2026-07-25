import React from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  error,
  onChange,
  required = false,
  icon = null,
  ...props
}) => {
  return (
    <div className={styles.inputContainer}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && (
          <span className={`material-symbols-outlined ${styles.inputIcon}`}>
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${styles.input} ${icon ? styles.inputWithIcon : ''} ${
            error ? styles.inputError : ''
          }`}
          required={required}
          {...props}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  icon: PropTypes.string,
};

export default Input;