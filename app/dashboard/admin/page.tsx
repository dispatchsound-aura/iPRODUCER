import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../lib/auth';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session?.userId) return redirect('/login');
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
  
  if (currentUser?.role !== 'ADMIN') {
      return (
         <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--accent-orange)' }}>403 FORBIDDEN</h2>
            <p>You do not have Administrative clearances to view this matrix.</p>
         </div>
      );
  }

  const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
  });

  return (
     <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Master Administrative Node</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Overview of the complete TYPEBEAT User Ecosystem</p>
        
        <div style={{ background: 'rgba(5, 5, 10, 0.4)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ACCOUNT EMAIL</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ASSIGNED ROLE</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CREATED ON</th>
                    <th style={{ textAlign: 'right', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PROMOTE / DEMOTE</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px', fontWeight: 500 }}>{u.email}</td>
                        <td style={{ padding: '16px', color: u.role === 'SUPER_PRODUCER' ? 'var(--accent-blue)' : u.role === 'ADMIN' ? 'var(--accent-orange)' : 'var(--accent-green)', fontWeight: 700, letterSpacing: '1px', fontSize: '0.8rem' }}>{u.role}</td>
                        <td style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                            <form action="/api/admin/role" method="POST" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                            <input type="hidden" name="userId" value={u.id} />
                            <select name="newRole" defaultValue={u.role} style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }}>
                                <option value="ARTIST">ARTIST (Free)</option>
                                <option value="PRODUCER">PRODUCER ($10)</option>
                                <option value="SUPER_PRODUCER">SUPER_PRODUCER ($20)</option>
                                <option value="ADMIN">SYSTEM ADMIN</option>
                            </select>
                            <button type="submit" className="button highlight" style={{ padding: '6px 16px', fontSize: '0.75rem', borderRadius: '4px' }}>EXECUTE</button>
                            </form>
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
     </div>
  );
}
