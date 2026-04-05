import React from 'react';
import styles from './SpacedHeading.module.css';

interface SpacedHeadingProps {
  children: string;
  size?: number;
}

const SpacedHeading: React.FC<SpacedHeadingProps> = ({ children, size = 24 }) => {
  return (
    <h2 className={styles.heading} style={{ fontSize: size }}>
      {children}
    </h2>
  );
};

export default SpacedHeading;
