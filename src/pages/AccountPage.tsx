import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { usersApi, ApiError } from '../api';
import Nav from '../components/Nav';
import styles from './AccountPage.module.css';

const NAV_LINKS = [
  { label: 'PARCELAS', href: '/parcelas' },
  { label: 'HISTORICO', href: '/historico' },
  { label: 'REGISTRO', href: '/registro' },
  { label: 'AMBIENTE', href: '/environment' },
];

const AccountPage: React.FC = () => {
  const { user, logout, refresh } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [showPwdModal, setShowPwdModal] = useState(false);

  const [delPwd, setDelPwd] = useState('');
  const [delErr, setDelErr] = useState('');

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    try {
      await usersApi.updateProfile({ username: username.trim(), email: email.trim() });
      setProfileMsg('Perfil actualizado.');
      refresh();
    } catch (err) {
      setProfileErr(err instanceof ApiError ? err.detail : 'Error al guardar.');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(''); setPwdErr('');
    if (newPwd !== newPwd2) { setPwdErr('Las contraseñas no coinciden.'); return; }
    try {
      await usersApi.changePassword(oldPwd, newPwd);
      setPwdMsg('Contraseña actualizada.');
      setOldPwd(''); setNewPwd(''); setNewPwd2('');
      setShowPwdModal(false);
    } catch (err) {
      setPwdErr(err instanceof ApiError ? err.detail : 'Error al cambiar contraseña.');
    }
  };

  const acceptPolicy = async () => {
    try {
      await usersApi.acceptDataPolicy();
      refresh();
    } catch (_e) { /* ignore */ }
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDelErr('');
    if (!delPwd) { setDelErr('Introduce tu contraseña.'); return; }
    try {
      await usersApi.deleteAccount(delPwd);
      logout();
    } catch (err) {
      setDelErr(err instanceof ApiError ? err.detail : 'Error al eliminar cuenta.');
    }
  };

  return (
    <div className={styles.page}>
      <Nav links={NAV_LINKS} activeLink="/account" user={user?.email} tag="andalucía" />

      <div className={styles.container}>
        <h1 className={styles.heading}>Mi Cuenta</h1>

        {/* Profile Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Perfil</h2>
          {profileMsg && <div className={styles.success}>{profileMsg}</div>}
          {profileErr && <div className={styles.error}>{profileErr}</div>}
          <form onSubmit={saveProfile} className={styles.form}>
            <label className={styles.label}>
              USUARIO
              <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} />
            </label>
            <label className={styles.label}>
              EMAIL
              <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <div className={styles.label}>
              ROL
              <span className={styles.readonly}>{user?.role || 'user'}</span>
            </div>
            <button className={styles.btn} type="submit">Guardar cambios</button>
          </form>
        </div>

        {/* Password Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Acceso y credenciales</h2>
          <button className={styles.btn} onClick={() => setShowPwdModal(true)}>
            Cambiar contraseña
          </button>
        </div>

        {/* Data Policy Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Política de datos</h2>
          {user?.data_policy_accepted_at ? (
            <p className={styles.text}>Política aceptada el {new Date(user.data_policy_accepted_at).toLocaleDateString('es-ES')}</p>
          ) : (
            <button className={styles.btn} onClick={acceptPolicy}>Aceptar política de datos</button>
          )}
        </div>

        {/* Delete Account Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle} style={{ color: 'var(--fm-red)' }}>Eliminar cuenta</h2>
          <p className={styles.text}>Esta acción es irreversible. Tus datos serán anonimizados.</p>
          {delErr && <div className={styles.error}>{delErr}</div>}
          <form onSubmit={deleteAccount} className={styles.form}>
            <label className={styles.label}>
              CONFIRMAR CONTRASEÑA
              <input className={styles.input} type="password" value={delPwd} onChange={e => setDelPwd(e.target.value)} />
            </label>
            <button className={styles.btnDanger} type="submit">Eliminar mi cuenta</button>
          </form>
        </div>
      </div>

      {/* Password Modal */}
      {showPwdModal && (
        <div className={styles.overlay} onClick={() => setShowPwdModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.cardTitle}>Cambiar contraseña</h2>
            {pwdMsg && <div className={styles.success}>{pwdMsg}</div>}
            {pwdErr && <div className={styles.error}>{pwdErr}</div>}
            <form onSubmit={changePassword} className={styles.form}>
              <label className={styles.label}>
                CONTRASEÑA ACTUAL
                <input className={styles.input} type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} autoFocus />
              </label>
              <label className={styles.label}>
                NUEVA CONTRASEÑA
                <input className={styles.input} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              </label>
              <label className={styles.label}>
                REPETIR NUEVA CONTRASEÑA
                <input className={styles.input} type="password" value={newPwd2} onChange={e => setNewPwd2(e.target.value)} />
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className={styles.btn} type="submit">Actualizar</button>
                <button className={styles.btnOutline} type="button" onClick={() => setShowPwdModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
