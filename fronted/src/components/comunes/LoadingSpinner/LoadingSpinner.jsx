import React from 'react';
import PropTypes from 'prop-types';
import styles from './LoadingSpinner.module.css';

/**
 * Spinner de carga para toda la pantalla o contenedores
 * @param {boolean} fullScreen - Si debe ocupar toda la pantalla
 * @param {string} size - Tamaño (small, medium, large)
 */
const LoadingSpinner = ({ fullScreen = false, size = 'medium' }) => {
  const containerClass = fullScreen ? styles.fullScreen : styles.container;
  const spinnerClass = `${styles.spinner} ${styles[size]}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass}></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  fullScreen: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default LoadingSpinner;
