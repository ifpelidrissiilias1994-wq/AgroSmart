import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styles from './AuthPages.module.css';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || !password2) {
      setError('Debes introducir y confirmar la nueva contraseña.');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('password', password);
      form.append('password2', password2);
      await fetch(`/auth/reset/${token}`, { method: 'POST', body: form });
      navigate('/login', { replace: true });
    } catch (_e) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>AgroSmart</div>
        <div className={styles.tag}>andalucía</div>
        <h1 className={styles.title}>Nueva contraseña</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            NUEVA CONTRASEÑA
            <input className={styles.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="new-password" autoFocus />
          </label>
          <label className={styles.label}>
            REPETIR CONTRASEÑA
            <input className={styles.input} type="password" value={password2}
              onChange={e => setPassword2(e.target.value)} autoComplete="new-password" />
          </label>
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/login" className={styles.link}>Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
