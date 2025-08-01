import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const quittances = [
    { nom: 'Monsieur Dupont', email: 'dupont@email.com', date: '01/07/2025' },
    { nom: 'Madame Martin', email: 'martin@email.com', date: '01/06/2025' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Tableau de bord</h2>
      <button onClick={() => navigate('/creer')}>➕ Création quittance</button>
      <ul>
        {quittances.map((q, i) => (
          <li key={i}>{q.nom} — {q.email} — {q.date}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
