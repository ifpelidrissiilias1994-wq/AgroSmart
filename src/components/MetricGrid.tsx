import React from 'react';
import styles from './MetricGrid.module.css';

interface MetricGridProps {
  columns?: number;
  children: React.ReactNode;
}

const MetricGrid: React.FC<MetricGridProps> = ({ columns, children }) => {
  const style: React.CSSProperties = {};
  if (columns) {
    style.display = 'grid';
    style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }

  return (
    <div className={styles.grid} style={columns ? style : undefined}>
      {children}
    </div>
  );
};

export default MetricGrid;
