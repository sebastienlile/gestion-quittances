import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // 🔁 Données en dur (tu pourras les charger plus tard via une API)
  const quittances = [
    { nom: 'Monsieur Dupont', email: 'dupont@email.com', date: '01/07/2025' },
    { nom: 'Madame Martin', email: 'martin@email.com', date: '01/06/2025' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Tableau de bord</h2>
      <button onClick={() => navigate('/creer')} style={{ marginBottom: '1rem' }}>
        ➕ Création quittance
      </button>

      <h3>Dernières quittances envoyées :</h3>
      <ul>
        {quittances.map((q, index) => (
          <li key={index}>
            {q.nom} — {q.email} — {q.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;