'use client';
import { useState, useEffect } from 'react';

export default function UpdateChecker() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const res = await fetch('http://localhost:4000/api/updates');
        if (!res.ok) {
          throw new Error('Failed to fetch updates');
        }
        const data = await res.json();
        setUpdates(data.releases || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchUpdates();
  }, []);

  if (loading) return <div className="text-sm text-gray-400">Checking for updates...</div>;
  if (error) return <div className="text-sm text-red-500">Error checking updates: {error}</div>;
  if (updates.length === 0) return null;

  const latestRelease = updates[0];

  return (
    <div style={{
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      padding: '10px 15px',
      borderRadius: '8px',
      marginBottom: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <strong style={{ color: '#60a5fa' }}>Update Available!</strong> 
        <span style={{ marginLeft: '10px' }}>Version {latestRelease.tag_name} is out.</span>
      </div>
      <a 
        href={latestRelease.html_url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          background: '#3b82f6',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '14px'
        }}
      >
        View Release
      </a>
    </div>
  );
}
