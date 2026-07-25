import React from 'react';
import PropTypes from 'prop-types';
import styles from './PageHeader.module.css';

const PageHeader = ({ breadcrumbs, title, subtitle, action }) => {
  return (
    <div className={styles.container}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb}>
                {idx > 0 && <span className={styles.separator}>›</span>}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? styles.breadcrumbActive
                      : styles.breadcrumb
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

PageHeader.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
};

export default PageHeader;