import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';

function App() {
  const [civilite, setCivilite] = useState('');
  const [emailLocataire, setEmailLocataire] = useState('');
  const [nomLocataire, setNomLocataire] = useState('');
  const [adresseLocataire, setAdresseLocataire] = useState('');
  const [montantLoyer, setMontantLoyer] = useState('');
  const [montantCharges, setMontantCharges] = useState('');
  const [datePaiement, setDatePaiement] = useState('');
  const [mois, setMois] = useState('');
  const [annee, setAnnee] = useState('');
  const [periodeLoyer, setPeriodeLoyer] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('formulaire');
  const [historique, setHistorique] = useState([]);

  const genererPeriodeLoyer = (moisIndex, annee) => {
    if (moisIndex === '' || annee === '') return '';
    const dateDebut = new Date(annee, moisIndex, 1);
    const dateFin = new Date(annee, parseInt(moisIndex) + 1, 0);
    const format = (d) => d.toLocaleDateString('fr-FR');
    return `${format(dateDebut)} au ${format(dateFin)}`;
  };

  useEffect(() => {
    if (mois !== '' && annee !== '') {
      const periode = genererPeriodeLoyer(mois, annee);
      setPeriodeLoyer(periode);
    }
  }, [mois, annee]);

  useEffect(() => {
    if (mode === 'dashboard') {
      chargerHistorique();
    }
  }, [mode]);

  const chargerHistorique = async () => {
    const { data, error } = await supabase.from('quittances').select('*').order('date_envoi', { ascending: false });
    if (error) {
      console.error('Erreur chargement historique:', error);
    } else {
      setHistorique(data);
    }
  };

  const supprimerQuittance = async (id) => {
    const { error } = await supabase.from('quittances').delete().eq('id', id);
    if (error) {
      console.error('Erreur suppression:', error);
    } else {
      setHistorique(historique.filter(q => q.id !== id));
    }
  };

  const envoyerQuittance = async () => {
    setLoading(true);
    setMessage('');
    try {
      await axios.post('https://quittances-backend.onrender.com/api/envoyer-quittance', {
        civilite,
        emailLocataire,
        nomLocataire,
        adresseLocataire,
        montantLoyer,
        montantCharges,
        datePaiement,
        periodeLoyer
      });

      await supabase.from('quittances').insert([
        {
          civilite,
          nom: nomLocataire,
          email: emailLocataire,
          adresse: adresseLocataire,
          loyer: parseFloat(montantLoyer),
          charges: parseFloat(montantCharges),
          periode: periodeLoyer
        }
      ]);

      setMessage('✅ Quittance envoyée avec succès !');
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de l\'envoi de la quittance.');
    }
    setLoading(false);
  };

  if (mode === 'dashboard') {
    return (
      <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem', fontFamily: 'Arial' }}>
        <h2>Tableau de bord</h2>
        <button onClick={() => setMode('formulaire')}>➕ Créer une quittance</button>
        <ul>
          {historique.length === 0 && <li>Aucune quittance enregistrée.</li>}
          {historique.map((q, index) => (
            <li key={q.id} style={{ marginBottom: '0.5rem' }}>
              {q.civilite} {q.nom} — {q.email} — {q.periode} — {new Date(q.date_envoi).toLocaleDateString('fr-FR')}
              <button
                onClick={() => supprimerQuittance(q.id)}
                style={{ marginLeft: '1rem', color: 'white', backgroundColor: 'red', border: 'none', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
              >
                🗑️ Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Envoyer une quittance de loyer</h2>

      <button onClick={() => setMode('dashboard')} style={{ marginBottom: '1rem' }}>
        📊 Voir les quittances envoyées
      </button>

      <label>Civilité :</label>
      <select value={civilite} onChange={e => setCivilite(e.target.value)}>
        <option value="">-- Choisir --</option>
        <option value="Monsieur">Monsieur</option>
        <option value="Madame">Madame</option>
      </select><br />

      <input type="email" placeholder="Email du locataire" value={emailLocataire} onChange={e => setEmailLocataire(e.target.value)} required /><br />
      <input type="text" placeholder="Nom du locataire" value={nomLocataire} onChange={e => setNomLocataire(e.target.value)} /><br />
      <input type="text" placeholder="Adresse du locataire" value={adresseLocataire} onChange={e => setAdresseLocataire(e.target.value)} /><br />
      <input type="number" placeholder="Montant du loyer (€)" value={montantLoyer} onChange={e => setMontantLoyer(e.target.value)} /><br />
      <input type="number" placeholder="Montant des charges (€)" value={montantCharges} onChange={e => setMontantCharges(e.target.value)} /><br />
      <input type="date" value={datePaiement} onChange={e => setDatePaiement(e.target.value)} /><br />

      <label>Mois :</label>
      <select value={mois} onChange={e => setMois(e.target.value)}>
        <option value="">-- Choisir un mois --</option>
        <option value="0">Janvier</option>
        <option value="1">Février</option>
        <option value="2">Mars</option>
        <option value="3">Avril</option>
        <option value="4">Mai</option>
        <option value="5">Juin</option>
        <option value="6">Juillet</option>
        <option value="7">Août</option>
        <option value="8">Septembre</option>
        <option value="9">Octobre</option>
        <option value="10">Novembre</option>
        <option value="11">Décembre</option>
      </select><br />

      <label>Année :</label>
      <input type="number" placeholder="ex : 2025" value={annee} onChange={e => setAnnee(e.target.value)} /><br />

      <p><strong>Période générée :</strong> {periodeLoyer || '—'}</p>

      <button onClick={envoyerQuittance} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Envoi en cours...' : 'Envoyer la quittance'}
      </button>
      <p>{message}</p>
    </div>
  );
}

export default App;
