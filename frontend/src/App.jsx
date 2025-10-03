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
  const [tri, setTri] = useState({ colonne: 'date_envoi', ordre: 'desc' });
  const thStyle = { padding: '0.75rem', borderBottom: '1px solid #ccc', cursor: 'pointer' };

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
    const format = (d) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return `${format(dateDebut)}`;
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

  const appliquerTri = (données) => {
    const copie = [...données];
    const { colonne, ordre } = tri;

    return copie.sort((a, b) => {
      const valA = a[colonne]?.toString().toLowerCase();
      const valB = b[colonne]?.toString().toLowerCase();

      if (valA < valB) return ordre === 'asc' ? -1 : 1;
      if (valA > valB) return ordre === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const trierPar = (colonne) => {
    setTri((prev) => ({
      colonne,
      ordre: prev.colonne === colonne && prev.ordre === 'asc' ? 'desc' : 'asc'
    }));
  };

  const consulterQuittance = async (q) => {
    try {
      const response = await axios.post('https://quittances-backend.onrender.com/api/generer-quittance', {
        civilite: q.civilite,
        emailLocataire: q.email,
        nomLocataire: q.nom,
        adresseLocataire: q.adresse,
        montantLoyer: q.loyer,
        montantCharges: q.charges,
        datePaiement: new Date().toISOString().split('T')[0],
        periodeLoyer: q.periode
      }, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Erreur consultation quittance :', err);
      alert('❌ Impossible de consulter la quittance.');
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
    periode: periodeLoyer,
    date_envoi: new Date().toISOString()
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
    <th onClick={() => trierPar('nom')} style={thStyle}>
      Locataire {tri.colonne === 'nom' && (tri.ordre === 'asc' ? '▲' : '▼')}
    </th>
    <th onClick={() => trierPar('email')} style={thStyle}>
      Email {tri.colonne === 'email' && (tri.ordre === 'asc' ? '▲' : '▼')}
    </th>
    <th onClick={() => trierPar('periode')} style={thStyle}>
      Période {tri.colonne === 'periode' && (tri.ordre === 'asc' ? '▲' : '▼')}
    </th>
    <th onClick={() => trierPar('date_envoi')} style={thStyle}>
      Date d'envoi {tri.colonne === 'date_envoi' && (tri.ordre === 'asc' ? '▲' : '▼')}
    </th>
    <th style={{ ...thStyle, width: '110px' }}>Actions</th>
  </tr>
</thead>

   <tbody>
            {appliquerTri(quittancesFiltrees).map((q) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{q.civilite} {q.nom}</td>
                <td style={{ padding: '0.75rem' }}>{q.email}</td>
                <td style={{ padding: '0.75rem' }}>{q.periode}</td>
                <td style={{ padding: '0.75rem' }}>{new Date(q.date_envoi).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => consulterQuittance(q)}
                    style={{
                      flex: 1,
                      backgroundColor: 'green',
                      color: 'white',
                      border: 'none',
                      padding: '0.3rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔍
                  </button>
                  <button
                    onClick={() => supprimerQuittance(q.id)}
                    style={{
                      flex: 1,
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      padding: '0.3rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
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
