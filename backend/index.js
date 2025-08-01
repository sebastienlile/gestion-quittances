const PDFDocument = require('pdfkit');
const fs = require('fs');
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
    pass: 'knrwbqjkjfmqgezy'
  }
});

app.post('/api/envoyer-quittance', (req, res) => {
  const { emailLocataire, montantLoyer, montantCharges, datePaiement } = req.body;

  // 1. Créer le PDF dans un buffer (pas besoin de fichier temporaire)
  const doc = new PDFDocument();
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);

    // 2. Configuration de l'email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: emailLocataire,
      subject: 'Quittance de Loyer',
      html: `
        <h3>Quittance de Loyer</h3>
        <p>Veuillez trouver ci-joint la quittance pour le paiement du loyer.</p>
      `,
      attachments: [
        {
          filename: `quittance-${datePaiement}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Erreur lors de l\'envoi de la quittance.');
      }
      res.status(200).send('Quittance PDF envoyée avec succès.');
    });
  });

  // 3. Contenu du PDF
  doc.fontSize(18).text('Quittance de Loyer', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Montant du loyer : ${montantLoyer} €`);
  doc.text(`Montant des charges : ${montantCharges} €`);
  doc.text(`Date de paiement : ${datePaiement}`);
  doc.text(`Établie sous réserve d'encaissement.`);
doc.image('signature.png', {
  fit: [120, 60],      // Taille réduite de l’image
  align: 'right',
  valign: 'bottom'

});
  doc.end();
});

app.listen(5000, () => console.log('Serveur démarré sur le port 5000'));