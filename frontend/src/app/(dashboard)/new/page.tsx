'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBot() {
  const router = useRouter();
  const [zip, setZip] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: upload bot via api
    alert("Uploading bot...");
    router.push('/');
  };

  return (
    <div>
      <h1 className="card-title" style={{ fontSize: '24px', marginBottom: '24px' }}>Create New Bot</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Upload Bot ZIP</label>
            <input 
              type="file" 
              accept=".zip" 
              className="input" 
              onChange={e => setZip(e.target.files?.[0] || null)} 
              required
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Must contain package.json or requirements.txt in the root.</p>
          </div>
          <button type="submit" className="btn">Create Bot</button>
        </form>
      </div>
    </div>
  );
}
