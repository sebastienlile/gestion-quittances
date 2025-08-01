const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sebastien95360@gmail.com',
    pass: 'knrw bqjk jfmq gezy'
  }
});

app.post('/api/envoyer-quittance', (req, res) => {
  const { emailLocataire, montantLoyer, montantCharges, datePaiement } = req.body;

  const mailOptions = {
    from: 'sebastien95360@gmail.com',
    to: emailLocataire,
    subject: 'Quittance de Loyer',
    html: `
      <h3>Quittance de Loyer</h3>
      <p>Je soussigné(e), propriétaire du logement, certifie avoir reçu le paiement suivant :</p>
      <ul>
        <li>Montant du loyer : <b>${montantLoyer}€</b></li>
        <li>Montant des charges : <b>${montantCharges}€</b></li>
        <li>Date de paiement : <b>${datePaiement}</b></li>
      </ul>
      <p>Cette quittance est établie sous réserve d'encaissement.</p>
      <p>Bien cordialement.</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Erreur lors de l\'envoi de la quittance.');
    }
    res.status(200).send('Quittance envoyée avec succès.');
  });
});

app.listen(5000, () => console.log('Serveur démarré sur le port 5000'));