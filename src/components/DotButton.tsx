import React from 'react';
import styles from './DotButton.module.css';

interface DotButtonProps {
  variant?: 'primary' | 'outline' | 'ghost';
  children: string;
  onClick?: () => void;
  href?: string;
  dotColor?: string;
}

const DotButton: React.FC<DotButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
  href,
  dotColor,
}) => {
  const className = `${styles.button} ${styles[variant]}`;
  const dotStyle = dotColor ? { background: dotColor } : undefined;

  const content = (
    <>
      <span className={styles.dot} style={dotStyle} />
      <span className={styles.dot} style={dotStyle} />
      <span>{children}</span>
      <span className={styles.dot} style={dotStyle} />
      <span className={styles.dot} style={dotStyle} />
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {content}
    </button>
  );
};

export default DotButton;
