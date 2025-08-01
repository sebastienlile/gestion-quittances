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

  const locataires = [
    {
      nom: 'Sébastien Lile',
      email: 'sebastien95360@gmail.com',
      civilite: 'Monsieur',
      adresse: '13 rue des charonnerets, Richemont 57270',
      loyer: 1800,
      charges: 0
    },
    {
      nom: 'Abu Nayeem',
      email: 'anmnayeem7@gmail.com',
      civilite: 'Monsieur',
      adresse: '535 grande rue - Carrière sous Poissy',
      loyer: 400,
      charges: 100
    },
    {
      nom: 'Jules Goumaye',
      email: 'julesgoumaye55@gmail.com',
      civilite: 'Monsieur',
      adresse: '535 grande rue - Carrière sous Poissy',
      loyer: 500,
      charges: 100
    },
    {
      nom: 'Mohamed Lansary',
      email: 'lansarfrance@gmail.com',
      civilite: 'Monsieur',
      adresse: '535 grande rue - Carrière sous Poissy',
      loyer: 400,
      charges: 100
    },
    {
      nom: 'Mehdi El Khalifi',
      email: 'medi.fv@hotmail.fr',
      civilite: 'Monsieur',
      adresse: '535 grande rue - Carrière sous Poissy',
      loyer: 600,
      charges: 100
    },
    {
      nom: 'Mya Kristenne',
      email: 'myakristenne@gmail.com',
      civilite: 'Madame',
      adresse: '535 grande rue - Carrière sous Poissy',
      loyer: 400,
      charges: 100
    }
  ];

  const handleSelectionLocataire = (nom) => {
    const locataire = locataires.find(l => l.nom === nom);
    if (locataire) {
      setNomLocataire(locataire.nom);
      setEmailLocataire(locataire.email);
      setCivilite(locataire.civilite);
      setAdresseLocataire(locataire.adresse);
      setMontantLoyer(locataire.loyer);
      setMontantCharges(locataire.charges);
    }
  };

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
    const { data, error } = await supabase.from('Quittance').select('*').order('date_envoi', { ascending: false });
    if (error) {
      console.error('Erreur chargement historique:', error.message || error);
    } else {
      setHistorique(data);
    }
  };

  const supprimerQuittance = async (id) => {
    const { error } = await supabase.from('Quittance').delete().eq('id', id);
    if (error) {
      console.error('Erreur suppression Supabase:', error.message || error);
    } else {
      setHistorique(historique.filter(q => q.id !== id));
      console.log('✅ Quittance supprimée');
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

      const { error } = await supabase.from('Quittance').insert([
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

      if (error) {
        console.error('Erreur insertion Supabase:', error.message || error);
      } else {
        console.log('✅ Données insérées dans Supabase');
        chargerHistorique();
      }

      setMessage('✅ Quittance envoyée avec succès !');
    } catch (error) {
      console.error('Erreur générale:', error);
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
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial', backgroundColor: '#fefefe', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Quittance de loyer</h2>

      <button onClick={() => setMode('dashboard')} style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#eee', border: 'none', borderRadius: '5px' }}>
        📊 Voir les quittances envoyées
      </button>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label>Locataire :</label>
          <select value={nomLocataire} onChange={e => handleSelectionLocataire(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="">-- Sélectionner --</option>
            {locataires.map((l, index) => (
              <option key={index} value={l.nom}>{l.nom}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Civilité :</label>
          <select value={civilite} onChange={e => setCivilite(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="">-- Choisir --</option>
            <option value="Monsieur">Monsieur</option>
            <option value="Madame">Madame</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input type="email" placeholder="Email" value={emailLocataire} onChange={e => setEmailLocataire(e.target.value)} style={{ flex: '1 1 48%', padding: '0.5rem', marginBottom: '1rem' }} />
        <input type="text" placeholder="Nom complet" value={nomLocataire} onChange={e => setNomLocataire(e.target.value)} style={{ flex: '1 1 48%', padding: '0.5rem', marginBottom: '1rem' }} />
        <input type="text" placeholder="Adresse" value={adresseLocataire} onChange={e => setAdresseLocataire(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
        <input type="number" placeholder="Loyer (€)" value={montantLoyer} onChange={e => setMontantLoyer(e.target.value)} style={{ flex: '1 1 48%', padding: '0.5rem', marginBottom: '1rem' }} />
        <input type="number" placeholder="Charges (€)" value={montantCharges} onChange={e => setMontantCharges(e.target.value)} style={{ flex: '1 1 48%', padding: '0.5rem', marginBottom: '1rem' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input type="date" value={datePaiement} onChange={e => setDatePaiement(e.target.value)} style={{ flex: 1, padding: '0.5rem' }} />
        <select value={mois} onChange={e => setMois(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
          <option value="">-- Mois --</option>
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
        </select>
        <input type="number" placeholder="Année" value={annee} onChange={e => setAnnee(e.target.value)} style={{ flex: 1, padding: '0.5rem' }} />
      </div>

      <p><strong>Période générée :</strong> {periodeLoyer || '—'}</p>

      <button onClick={envoyerQuittance} disabled={loading} style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer' }}>
        {loading ? 'Envoi en cours...' : '📨 Envoyer la quittance'}
      </button>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>{message}</p>
    </div>
  );
}

export default App;
