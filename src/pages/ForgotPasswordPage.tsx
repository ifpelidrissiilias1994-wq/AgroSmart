import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthPages.module.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Introduce un correo electrónico.');
      return;
    }
    setLoading(true);
    try {
      // Use the form-based endpoint since it doesn't need JSON response
      const form = new FormData();
      form.append('email', email.trim());
      await fetch('/auth/forgot', { method: 'POST', body: form });
      setSent(true);
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
        <h1 className={styles.title}>Recuperar contraseña</h1>

        {sent ? (
          <div className={styles.success}>
            Si existe una cuenta asociada a ese correo, se ha enviado un enlace de restablecimiento.
          </div>
        ) : (
          <>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                EMAIL
                <input className={styles.input} type="email" value={email}
                  onChange={e => setEmail(e.target.value)} autoFocus />
              </label>
              <button className={styles.submit} type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}

        <div className={styles.links}>
          <Link to="/login" className={styles.link}>Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
