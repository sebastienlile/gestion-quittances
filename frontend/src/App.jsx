import { useState } from 'react';
import axios from 'axios';

function App() {
  const [emailLocataire, setEmailLocataire] = useState('');
  const [nomLocataire, setNomLocataire] = useState('');
  const [adresseLocataire, setAdresseLocataire] = useState('');
  const [montantLoyer, setMontantLoyer] = useState('');
  const [montantCharges, setMontantCharges] = useState('');
  const [datePaiement, setDatePaiement] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const envoyerQuittance = async () => {
    setLoading(true);
    setMessage('');
    try {
      await axios.post('https://quittances-backend.onrender.com/api/envoyer-quittance', {
        emailLocataire,
        nomLocataire,
        adresseLocataire,
        montantLoyer,
        montantCharges,
        datePaiement
      });
      setMessage('✅ Quittance envoyée avec succès !');
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de l\'envoi de la quittance.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Envoyer une quittance de loyer</h2>
      <input type="email" placeholder="Email du locataire" value={emailLocataire} onChange={e => setEmailLocataire(e.target.value)} required /><br />
      <input type="text" placeholder="Nom du locataire" value={nomLocataire} onChange={e => setNomLocataire(e.target.value)} /><br />
      <input type="text" placeholder="Adresse du locataire" value={adresseLocataire} onChange={e => setAdresseLocataire(e.target.value)} /><br />
      <input type="number" placeholder="Montant du loyer (€)" value={montantLoyer} onChange={e => setMontantLoyer(e.target.value)} /><br />
      <input type="number" placeholder="Montant des charges (€)" value={montantCharges} onChange={e => setMontantCharges(e.target.value)} /><br />
      <input type="date" value={datePaiement} onChange={e => setDatePaiement(e.target.value)} /><br />
      <button onClick={envoyerQuittance} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Envoi en cours...' : 'Envoyer la quittance'}
      </button>
      <p>{message}</p>
    </div>
  );
}

export default App;