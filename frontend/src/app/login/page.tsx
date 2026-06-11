'use client';

export default function Login() {
  const login = () => {
    window.location.href = `http://localhost:4000/api/auth/discord`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <button className="btn" onClick={login}>Login with Discord</button>
    </div>
  );
}
