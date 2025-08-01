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
  const [recherche, setRecherche] = useState('');


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
  const quittancesFiltrees = historique.filter(q =>
    q.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    q.email.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>📋 Tableau de bord des quittances</h2>
      <button
        onClick={() => setMode('formulaire')}
        style={{
          margin: '1rem auto',
          display: 'block',
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none'
        }}
      >
        ➕ Créer une quittance
      </button>

      <input
        type="text"
        placeholder="🔍 Rechercher un locataire..."
        value={recherche}
        onChange={e => setRecherche(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}
      />

      {quittancesFiltrees.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Aucune quittance trouvée.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #ccc' }}>Locataire</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #ccc' }}>Email</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #ccc' }}>Période</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #ccc' }}>Date d'envoi</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #ccc' }}></th>
            </tr>
          </thead>
          <tbody>
            {quittancesFiltrees.map((q) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{q.civilite} {q.nom}</td>
                <td style={{ padding: '0.75rem' }}>{q.email}</td>
                <td style={{ padding: '0.75rem' }}>{q.periode}</td>
                <td style={{ padding: '0.75rem' }}>{new Date(q.date_envoi).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => supprimerQuittance(q.id)}
                    style={{
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      padding: '0.4rem 0.7rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial', backgroundColor: '#fefefe', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Envoyer une quittance de loyer</h2>

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
