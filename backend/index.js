const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ✉️ Configuration Nodemailer (⚠️ remplace par process.env en production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sebastien95360@gmail.com',              // à sécuriser dans Render
    pass: 'knrwbqjkjfmqgezy'                        // mot de passe d'application Gmail
  }
});

app.post('/api/envoyer-quittance', (req, res) => {
const {
  emailLocataire,
  nomLocataire,
  adresseLocataire,
  montantLoyer,
  montantCharges,
  datePaiement,
  periodeLoyer // 👈 ajout obligatoire
} = req.body;

  const total = parseFloat(montantLoyer) + parseFloat(montantCharges);

  // === Création du PDF
  const doc = new PDFDocument();
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);

    const mailOptions = {
      from: 'sebastien95360@gmail.com',
      to: emailLocataire,
      subject: 'Quittance de Loyer',
      html: `
  <p>Bonjour ${nomLocataire},</p>
  <p>Veuillez trouver ci-joint votre quittance de loyer.</p>
  <p>Cordialement,<br/>Sébastien Lile</p>
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
        return res.status(500).send("Erreur lors de l'envoi de la quittance.");
      }
      res.status(200).send('Quittance PDF envoyée avec succès.');
    });
  });

  // === Modèle de la quittance
doc.fontSize(18).text('Quittance de Loyer', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Je soussigné, Sébastien Lile, propriétaire du logement situé au :`);
  doc.text(`535 Grande Rue, 78955 Carrières-sous-Poissy,`);
  doc.text(`déclare avoir reçu de la part de :`);
  doc.moveDown();
  doc.text(`  • Nom du locataire : ${nomLocataire}`);
  doc.text(`  • Adresse du locataire : ${adresseLocataire}`);
  doc.moveDown();
  doc.text(`Le paiement du loyer pour la période : ${periodeLoyer}`);
  doc.moveDown();
  doc.text(`  • Montant du loyer : ${montantLoyer} €`);
  doc.text(`  • Montant des charges : ${montantCharges} €`);
  doc.font('Helvetica-Bold');
  doc.text(`  • Total payé : ${total} €`);
  doc.font('Helvetica');
  doc.moveDown();
  doc.text(`Fait le : ${new Date().toLocaleDateString('fr-FR')}`);
  doc.moveDown(2);
  doc.text('Sébastien Lile',);

  // Ajout de la signature si l’image existe
  const signaturePath = path.join(__dirname, 'signature.png');
  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, {
      fit: [120, 60],
      align: 'right',
      valign: 'bottom'
    });
  } else {
    console.warn('⚠️ signature.png non trouvée dans le dossier backend.');
  }

  doc.end();
});

app.listen(5000, () => console.log('Serveur démarré sur le port 5000'));