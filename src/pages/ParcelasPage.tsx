import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { parcelsApi, cadastreApi, ApiError, type Parcel, type CropType, type CropVariety } from '../api';
import Nav from '../components/Nav';
import DotButton from '../components/DotButton';
import FMTable from '../components/FMTable';
import styles from './ParcelasPage.module.css';

const NAV_LINKS = [
  { label: 'PARCELAS', href: '/parcelas' },
  { label: 'HISTORICO', href: '/historico' },
  { label: 'REGISTRO', href: '/registro' },
  { label: 'AMBIENTE', href: '/environment' },
];

const ParcelasPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRC, setSearchRC] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Create modal state
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [cropVarieties, setCropVarieties] = useState<CropVariety[]>([]);
  const [createForm, setCreateForm] = useState({
    name: '', crop_type_id: '', crop_variety_id: '', transplant_date: '', rc: '',
  });
  const [createErr, setCreateErr] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadParcels = useCallback(async () => {
    try {
      const data = await parcelsApi.list();
      setParcels(data);
    } catch (_e) { /* handled by ProtectedRoute */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadParcels(); }, [loadParcels]);

  // Load crop types when create modal opens
  useEffect(() => {
    if (showCreate && cropTypes.length === 0) {
      parcelsApi.cropTypes().then(setCropTypes).catch(() => {});
    }
  }, [showCreate, cropTypes.length]);

  // Load varieties when crop type changes
  useEffect(() => {
    if (createForm.crop_type_id) {
      parcelsApi.cropVarieties(Number(createForm.crop_type_id)).then(setCropVarieties).catch(() => {});
    } else {
      setCropVarieties([]);
    }
  }, [createForm.crop_type_id]);

  const handleSearch = async () => {
    if (!searchRC.trim()) return;
    try {
      const result = await cadastreApi.lookup(searchRC.trim()) as Record<string, unknown>;
      if (result.geometry) {
        setCreateForm(f => ({ ...f, rc: searchRC.trim() }));
        setShowCreate(true);
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.detail : 'Referencia no encontrada.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErr('');
    if (!createForm.name.trim()) { setCreateErr('Nombre obligatorio.'); return; }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = { name: createForm.name.trim() };
      if (createForm.crop_variety_id) payload.crop_variety_id = Number(createForm.crop_variety_id);
      if (createForm.transplant_date) payload.transplant_date = createForm.transplant_date;
      if (createForm.rc) payload.rc = createForm.rc;
      await parcelsApi.create(payload);
      setShowCreate(false);
      setCreateForm({ name: '', crop_type_id: '', crop_variety_id: '', transplant_date: '', rc: '' });
      loadParcels();
    } catch (err) {
      setCreateErr(err instanceof ApiError ? err.detail : 'Error al crear parcela.');
    }
    setCreating(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await parcelsApi.delete(deleteId);
      setShowDelete(false);
      setDeleteId(null);
      loadParcels();
    } catch (_e) { /* ignore */ }
    setDeleting(false);
  };

  const statusBadge = (_p: Parcel) => {
    // Simple heuristic based on NDVI or other fields
    return <span className={styles.statusNormal}>Normal</span>;
  };

  const headers = ['ID', 'PARCELA', 'CULTIVO', 'VARIEDAD', 'AREA', 'ESTADO'];

  const rows: React.ReactNode[][] = parcels.map(p => [
    String(p.id),
    <Link to={`/parcela/${p.id}`} className={styles.parcelLink}>{p.name || `Parcela #${p.id}`}</Link>,
    p.crop || '—',
    p.variety || '—',
    p.area_ha != null ? `${p.area_ha.toFixed(1)} ha` : '—',
    statusBadge(p),
  ]);

  return (
    <div className={styles.page}>
      <Nav links={NAV_LINKS} activeLink="/parcelas" user={user?.email} tag="andalucía" onLogout={logout} />

      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Parcelas</h1>
            <DotButton variant="primary" onClick={() => setShowCreate(true)}>NUEVA PARCELA</DotButton>
            {parcels.length > 0 && (
              <DotButton variant="outline" onClick={() => setShowDelete(true)}>ELIMINAR</DotButton>
            )}
          </div>

          <div className={styles.searchRow}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Referencia catastral..."
              value={searchRC}
              onChange={e => setSearchRC(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <DotButton variant="primary" onClick={handleSearch}>BUSCAR EN CATASTRO</DotButton>
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando parcelas...</div>
          ) : parcels.length === 0 ? (
            <div className={styles.empty}>No tienes parcelas. Crea una para empezar.</div>
          ) : (
            <FMTable headers={headers} rows={rows} />
          )}
        </div>

        <div className={styles.right}>
          <div className={styles.mapPlaceholder}>
            Mapa interactivo
          </div>
        </div>
      </div>

      {/* Create Parcel Modal */}
      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nueva Parcela</h2>
            {createErr && <div className={styles.error}>{createErr}</div>}
            <form onSubmit={handleCreate} className={styles.modalForm}>
              <label className={styles.modalLabel}>
                NOMBRE
                <input className={styles.modalInput} value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </label>
              <label className={styles.modalLabel}>
                REFERENCIA CATASTRAL
                <input className={styles.modalInput} value={createForm.rc}
                  onChange={e => setCreateForm(f => ({ ...f, rc: e.target.value }))} placeholder="Ej: 23001A00100045" />
              </label>
              <label className={styles.modalLabel}>
                FECHA DE TRASPLANTE
                <input className={styles.modalInput} type="date" value={createForm.transplant_date}
                  onChange={e => setCreateForm(f => ({ ...f, transplant_date: e.target.value }))} />
              </label>
              <label className={styles.modalLabel}>
                CULTIVO
                <select className={styles.modalInput} value={createForm.crop_type_id}
                  onChange={e => setCreateForm(f => ({ ...f, crop_type_id: e.target.value, crop_variety_id: '' }))}>
                  <option value="">— Seleccionar —</option>
                  {cropTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                </select>
              </label>
              {cropVarieties.length > 0 && (
                <label className={styles.modalLabel}>
                  VARIEDAD
                  <select className={styles.modalInput} value={createForm.crop_variety_id}
                    onChange={e => setCreateForm(f => ({ ...f, crop_variety_id: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {cropVarieties.map(cv => <option key={cv.id} value={cv.id}>{cv.name}</option>)}
                  </select>
                </label>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className={styles.modalBtn} type="submit" disabled={creating}>
                  {creating ? 'Creando...' : 'Crear parcela'}
                </button>
                <button className={styles.modalBtnOutline} type="button" onClick={() => setShowCreate(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Parcel Modal */}
      {showDelete && (
        <div className={styles.overlay} onClick={() => setShowDelete(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Eliminar Parcela</h2>
            <select className={styles.modalInput} value={deleteId ?? ''} onChange={e => setDeleteId(Number(e.target.value))}>
              <option value="">— Seleccionar parcela —</option>
              {parcels.map(p => <option key={p.id} value={p.id}>{p.name || `Parcela #${p.id}`}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className={styles.modalBtnDanger} onClick={handleDelete} disabled={!deleteId || deleting}>
                {deleting ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
              <button className={styles.modalBtnOutline} onClick={() => setShowDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelasPage;
