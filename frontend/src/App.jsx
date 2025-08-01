import { useState } from 'react';
import axios from 'axios';

function App() {
  const [emailLocataire, setEmailLocataire] = useState('');
  const [montantLoyer, setMontantLoyer] = useState('');
  const [montantCharges, setMontantCharges] = useState('');
  const [datePaiement, setDatePaiement] = useState('');

  const envoyerQuittance = async () => {
    try {
      await axios.post('http://localhost:5000/api/envoyer-quittance', {
        emailLocataire,
        montantLoyer,
        montantCharges,
        datePaiement
      });
      alert('Quittance envoyée avec succès');
    } catch (error) {
      alert('Erreur lors de l\'envoi');
    }
  };

  return (
    <div>
      <h2>Gestion des Quittances de Loyer</h2>
      <input type="email" placeholder="Email du locataire" value={emailLocataire} onChange={e => setEmailLocataire(e.target.value)} />
      <input type="number" placeholder="Montant du loyer (€)" value={montantLoyer} onChange={e => setMontantLoyer(e.target.value)} />
      <input type="number" placeholder="Montant des charges (€)" value={montantCharges} onChange={e => setMontantCharges(e.target.value)} />
      <input type="date" value={datePaiement} onChange={e => setDatePaiement(e.target.value)} />
      <button onClick={envoyerQuittance}>Envoyer Quittance</button>
    </div>
  );
}

export default App;