import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { parcelsApi, dailyApi, type Parcel, type DailyMetrics } from '../api';
import Nav from '../components/Nav';
import styles from './DashboardPage.module.css';

const NAV_LINKS = [
  { label: 'PARCELAS', href: '/parcelas' },
  { label: 'HISTORICO', href: '/historico' },
  { label: 'REGISTRO', href: '/registro' },
  { label: 'AMBIENTE', href: '/environment' },
];

const fmt = (v: unknown, d = 1) => { if (v == null) return '—'; const n = Number(v); return isNaN(n) ? '—' : n.toFixed(d); };

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [daily, setDaily] = useState<DailyMetrics | null>(null);

  useEffect(() => {
    parcelsApi.list().then(p => {
      setParcels(p);
      if (p.length > 0) {
        dailyApi.latest(p[0].id).then(d => setDaily(d as DailyMetrics)).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const firstParcel = parcels[0];

  return (
    <div className={styles.page}>
      <Nav links={NAV_LINKS} activeLink="/dashboard" user={user?.email} tag="andalucía" onLogout={logout} />

      <div className={styles.container}>
        <h1 className={styles.greeting}>Buenos días, {user?.username || 'usuario'}</h1>
        <p className={styles.sub}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          {firstParcel ? ` · ${firstParcel.name}` : ''}
        </p>

        <div className={styles.kpiRow}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>CLIMA HOY</div>
            <div className={styles.kpiValue}>{daily?.tmax != null ? `${fmt(daily.tmax, 0)}°C` : '—'}</div>
            <div className={styles.kpiSub}>{fmt(daily?.precip, 1)} mm precip</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>ESTADO SUELO</div>
            <div className={styles.kpiValue}>{fmt(daily?.balance_mm)} mm</div>
            <div className={styles.kpiSub}>Balance hídrico</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>VPD</div>
            <div className={styles.kpiValue}>{fmt(daily?.vpd_kpa)} kPa</div>
            <div className={styles.kpiSub}>Déficit de presión de vapor</div>
          </div>
        </div>

        {daily?.messages && daily.messages.length > 0 && (
          <div className={styles.messages}>
            <h3 className={styles.messagesTitle}>Recomendaciones</h3>
            {daily.messages.map((m, i) => (
              <div key={i} className={styles.message}>{m}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
