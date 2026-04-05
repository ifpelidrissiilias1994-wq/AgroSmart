import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ApiError } from '../AuthContext';
import styles from './AuthPages.module.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/parcelas';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Usuario y contraseña son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.detail);
      else setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>AgroSmart</div>
        <div className={styles.tag}>andalucía</div>
        <h1 className={styles.title}>Iniciar sesión</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            USUARIO O EMAIL
            <input
              className={styles.input}
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </label>
          <label className={styles.label}>
            CONTRASEÑA
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/forgot-password" className={styles.link}>¿Olvidaste tu contraseña?</Link>
          <Link to="/register" className={styles.link}>Crear cuenta</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
