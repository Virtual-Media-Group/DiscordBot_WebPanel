'use client';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  // Dummy data for MVP layout
  const bots = [
    { id: '1', name: 'My Test Bot', status: 'RUNNING' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>Applications</h1>
        <button className="btn" onClick={() => router.push('/new')}>New Application</button>
      </div>
      
      <div className="card-grid">
        {bots.map(bot => (
          <div key={bot.id} className="card" onClick={() => router.push(`/${bot.id}`)}>
            <div className="card-title">{bot.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Status: {bot.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
