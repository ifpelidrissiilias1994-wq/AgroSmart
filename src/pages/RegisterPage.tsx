import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ApiError } from '../AuthContext';
import styles from './AuthPages.module.css';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password || !password2) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!acceptPolicy) {
      setError('Debes aceptar la política de tratamiento de datos.');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        password2,
        accept_data_policy: acceptPolicy,
      });
      navigate('/parcelas', { replace: true });
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
        <h1 className={styles.title}>Crear cuenta</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            NOMBRE DE USUARIO
            <input className={styles.input} type="text" value={username}
              onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus />
          </label>
          <label className={styles.label}>
            EMAIL
            <input className={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className={styles.label}>
            CONTRASEÑA
            <input className={styles.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
          <label className={styles.label}>
            REPETIR CONTRASEÑA
            <input className={styles.input} type="password" value={password2}
              onChange={e => setPassword2(e.target.value)} autoComplete="new-password" />
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={acceptPolicy}
              onChange={e => setAcceptPolicy(e.target.checked)} />
            Acepto la <a href="/legal/politica-tratamiento-datos" target="_blank" rel="noopener">política de tratamiento de datos</a>
          </label>
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/login" className={styles.link}>¿Ya tienes cuenta? Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
