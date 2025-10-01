import React, { useState } from 'react';
import { useAuth } from '../store/auth';
import logo from '../assets/negu/Negu.jpg'; // Importa el logo

export default function Vendedor() {
  const { vendedor, loading, error } = useAuth();
  const [form, setForm] = useState({ usuario: '', contrasena: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await vendedor(form);
    if (ok) {
      window.location.href = '/';
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={logo} alt="Negu Logo" style={styles.logo} />

        <h2 style={styles.title}>Has iniciado sesión como vendedor</h2>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 10px 30px rgba(0,0,0,.08)',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  logo: {
    width: 100,
    marginBottom: 20,
  },
  title: {
    marginTop: 0,
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    maxWidth: '320px', // Limita el ancho máximo
    alignSelf: 'center', // Centra el input dentro del form
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  primary: {
    marginTop: 16,
    width: '100%',
    maxWidth: '320px',
    alignSelf: 'center',
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 15,
  },
  error: {
    color: '#b91c1c',
    marginTop: 8,
    fontSize: 14,
  },
};