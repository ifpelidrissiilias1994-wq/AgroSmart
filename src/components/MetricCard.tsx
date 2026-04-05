import React from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  valueColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, valueColor }) => {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value} style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
  );
};

export default MetricCard;
