import React from 'react';
import styles from './FMTable.module.css';

interface FMTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  columnWidths?: (number | string)[];
}

const FMTable: React.FC<FMTableProps> = ({ headers, rows, columnWidths }) => {
  const getCellStyle = (index: number): React.CSSProperties | undefined => {
    if (!columnWidths || !columnWidths[index]) return undefined;
    const w = columnWidths[index];
    return {
      flex: 'none',
      width: typeof w === 'number' ? `${w}px` : w,
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        {headers.map((header, i) => (
          <div key={i} className={styles.headerCell} style={getCellStyle(i)}>
            {header}
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={styles.cell} style={getCellStyle(cellIndex)}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FMTable;
