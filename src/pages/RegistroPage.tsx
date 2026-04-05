import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { parcelsApi, actionsApi, ApiError, type Parcel, type Action } from '../api';
import Nav from '../components/Nav';
import DotButton from '../components/DotButton';
import styles from './RegistroPage.module.css';

const NAV_LINKS = [
  { label: 'PARCELAS', href: '/parcelas' },
  { label: 'HISTORICO', href: '/historico' },
  { label: 'REGISTRO', href: '/registro' },
  { label: 'AMBIENTE', href: '/environment' },
];

const ACTION_TYPES = [
  { value: 'irrigation', label: 'Riego', color: '#2563eb' },
  { value: 'fertilization', label: 'Fertilización', color: '#16a34a' },
  { value: 'treatment', label: 'Tratamiento', color: '#ca8a04' },
  { value: 'harvest', label: 'Cosecha', color: '#16a34a' },
  { value: 'note', label: 'Observación', color: '#6b7280' },
  { value: 'incident', label: 'Incidencia', color: '#dc2626' },
];

const RegistroPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    type: 'irrigation', date: new Date().toISOString().slice(0, 10),
    qty_value: '', qty_unit: 'mm', product: '', active_ingredient: '', method: '', note: '',
  });

  useEffect(() => {
    parcelsApi.list().then(p => {
      setParcels(p);
      if (p.length > 0) setSelectedId(p[0].id);
    }).catch(() => {});
  }, []);

  const loadActions = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const data = await actionsApi.list(selectedId);
      setActions(data);
    } catch (_e) { setActions([]); }
    setLoading(false);
  }, [selectedId]);

  useEffect(() => { loadActions(); }, [loadActions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setCreateErr('');
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        type: form.type,
        date: form.date,
        note: form.note || undefined,
      };
      if (form.qty_value) { payload.qty_value = Number(form.qty_value); payload.qty_unit = form.qty_unit; }
      if (form.product) payload.product = form.product;
      if (form.active_ingredient) payload.active_ingredient = form.active_ingredient;
      if (form.method) payload.method = form.method;
      await actionsApi.create(selectedId, payload);
      setShowCreate(false);
      setForm({ type: 'irrigation', date: new Date().toISOString().slice(0, 10), qty_value: '', qty_unit: 'mm', product: '', active_ingredient: '', method: '', note: '' });
      loadActions();
    } catch (err) {
      setCreateErr(err instanceof ApiError ? err.detail : 'Error al crear acción.');
    }
    setCreating(false);
  };

  const handleDelete = async (actionId: number) => {
    if (!selectedId) return;
    if (!confirm('¿Eliminar esta acción?')) return;
    try {
      await actionsApi.delete(selectedId, actionId);
      loadActions();
    } catch (_e) { /* ignore */ }
  };

  const typeInfo = (type: string) => ACTION_TYPES.find(t => t.value === type) || { label: type, color: '#6b7280' };

  return (
    <div className={styles.page}>
      <Nav links={NAV_LINKS} activeLink="/registro" user={user?.email} tag="andalucía" onLogout={logout} />

      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h1 className={styles.heading}>Registro de Acciones</h1>
          <DotButton variant="primary" onClick={() => setShowCreate(true)}>NUEVA ACCION</DotButton>
        </div>

        <div className={styles.parcelRow}>
          <select className={styles.select} value={selectedId ?? ''} onChange={e => setSelectedId(Number(e.target.value))}>
            {parcels.map(p => <option key={p.id} value={p.id}>{p.name || `#${p.id}`}</option>)}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Cargando acciones...</div>
        ) : actions.length === 0 ? (
          <div className={styles.empty}>Sin acciones registradas.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>FECHA</th><th>PARCELA</th><th>TIPO</th><th>DESCRIPCION</th><th>CANTIDAD</th><th></th></tr>
              </thead>
              <tbody>
                {actions.map(a => {
                  const info = typeInfo(a.type);
                  return (
                    <tr key={a.id}>
                      <td>{a.action_at?.slice(0, 10) || '—'}</td>
                      <td>{parcels.find(p => p.id === a.parcel_id)?.name || `#${a.parcel_id}`}</td>
                      <td><span className={styles.typeChip} style={{ borderColor: info.color, color: info.color }}>{info.label}</span></td>
                      <td>{a.note || a.product || '—'}</td>
                      <td>{a.qty_value != null ? `${a.qty_value} ${a.qty_unit || ''}` : '—'}</td>
                      <td><button className={styles.deleteBtn} onClick={() => handleDelete(a.id)}>×</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Action Modal */}
      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nueva Acción</h2>
            {createErr && <div className={styles.error}>{createErr}</div>}

            {/* Type tabs */}
            <div className={styles.typeTabs}>
              {ACTION_TYPES.map(t => (
                <button key={t.value}
                  className={`${styles.typeTab} ${form.type === t.value ? styles.typeTabActive : ''}`}
                  style={form.type === t.value ? { borderColor: t.color, color: t.color } : {}}
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreate} className={styles.modalForm}>
              <label className={styles.modalLabel}>FECHA
                <input className={styles.modalInput} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label className={styles.modalLabel} style={{ flex: 1 }}>CANTIDAD
                  <input className={styles.modalInput} type="number" step="any" value={form.qty_value} onChange={e => setForm(f => ({ ...f, qty_value: e.target.value }))} />
                </label>
                <label className={styles.modalLabel} style={{ flex: 1 }}>UNIDAD
                  <select className={styles.modalInput} value={form.qty_unit} onChange={e => setForm(f => ({ ...f, qty_unit: e.target.value }))}>
                    <option value="mm">mm</option><option value="L">L</option><option value="L/ha">L/ha</option>
                    <option value="kg">kg</option><option value="kg/ha">kg/ha</option><option value="t">t</option>
                  </select>
                </label>
              </div>
              <label className={styles.modalLabel}>PRODUCTO
                <input className={styles.modalInput} value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} />
              </label>
              <label className={styles.modalLabel}>PRINCIPIO ACTIVO
                <input className={styles.modalInput} value={form.active_ingredient} onChange={e => setForm(f => ({ ...f, active_ingredient: e.target.value }))} />
              </label>
              <label className={styles.modalLabel}>METODO DE APLICACION
                <input className={styles.modalInput} value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} />
              </label>
              <label className={styles.modalLabel}>NOTAS
                <textarea className={styles.modalTextarea} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={3} />
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className={styles.modalBtn} type="submit" disabled={creating}>{creating ? 'Guardando...' : 'Guardar'}</button>
                <button className={styles.modalBtnOutline} type="button" onClick={() => setShowCreate(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroPage;
