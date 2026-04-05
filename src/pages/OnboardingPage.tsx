import React from 'react';
import DotButton from '../components/DotButton';
import styles from './OnboardingPage.module.css';

const OnboardingPage: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <span className={styles.logo}>AgroSmart</span>
        <span className={styles.tag}>andalucía</span>
        <p className={styles.description}>
          Configura tu cuenta paso a paso para comenzar a monitorizar tus parcelas
          con datos satelitales y meteorológicos en tiempo real.
        </p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={`${styles.stepDot} ${styles.stepDone}`} />
            <span className={styles.stepLabel}>Cuenta creada</span>
          </div>
          <div className={styles.step}>
            <div className={`${styles.stepDot} ${styles.stepActive}`} />
            <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>Configurar parcela</span>
          </div>
          <div className={styles.step}>
            <div className={`${styles.stepDot} ${styles.stepFuture}`} />
            <span className={styles.stepLabel}>Sensores y fuentes</span>
          </div>
          <div className={styles.step}>
            <div className={`${styles.stepDot} ${styles.stepFuture}`} />
            <span className={styles.stepLabel}>Alertas y umbrales</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <h1 className={styles.title}>Configura tu primera parcela</h1>
        <p className={styles.subtitle}>
          Introduce los datos básicos de tu parcela. Podrás modificarlos más adelante.
        </p>

        {/* Form */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>NOMBRE DE LA PARCELA</label>
            <input className={styles.fieldInput} type="text" placeholder="Ej: Finca El Olivar" />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>CULTIVO PRINCIPAL</label>
            <input className={styles.fieldInput} type="text" defaultValue="Olivo" />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>VARIEDAD</label>
            <input className={styles.fieldInput} type="text" defaultValue="Picual" />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>ÁREA (HECTÁREAS)</label>
            <input className={styles.fieldInput} type="text" defaultValue="12.5" />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>PROVINCIA</label>
            <input className={styles.fieldInput} type="text" defaultValue="Jaén" />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>REFERENCIA CATASTRAL</label>
            <input
              className={`${styles.fieldInput} ${styles.fieldInputMono}`}
              type="text"
              defaultValue="23001A00100045"
            />
          </div>
        </div>

        {/* Hint box */}
        <div className={styles.hint}>
          <span className={styles.hintIcon}>ℹ</span>
          <span className={styles.hintText}>
            La referencia catastral permite vincular automáticamente los datos geoespaciales
            de tu parcela con las fuentes de datos satelitales y meteorológicos.
          </span>
        </div>

        {/* Nav row */}
        <div className={styles.navRow}>
          <button className={styles.back} type="button">← Atrás</button>
          <DotButton variant="primary">SIGUIENTE PASO</DotButton>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
