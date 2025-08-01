const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://quittances-frontend.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sebastien95360@gmail.com',
    pass: 'knrwbqjkjfmqgezy'
  }
});

// 📤 Route ENVOYER par mail
app.post('/api/envoyer-quittance', (req, res) => {
  const {
    civilite,
    emailLocataire,
    nomLocataire,
    adresseLocataire,
    montantLoyer,
    montantCharges,
    datePaiement,
    periodeLoyer
  } = req.body;

  const total = parseFloat(montantLoyer) + parseFloat(montantCharges);
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
        <p>Bonjour ${civilite} ${nomLocataire},</p>
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

  generatePDF(doc, civilite, nomLocataire, adresseLocataire, montantLoyer, montantCharges, periodeLoyer);
});

// 📄 Route pour CONSULTER (télécharger)
app.post('/api/generer-quittance', (req, res) => {
  const {
    civilite,
    nomLocataire,
    adresseLocataire,
    montantLoyer,
    montantCharges,
    datePaiement,
    periodeLoyer
  } = req.body;

  const doc = new PDFDocument();
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=quittance-${datePaiement}.pdf`);
    res.send(pdfBuffer);
  });

  generatePDF(doc, civilite, nomLocataire, adresseLocataire, montantLoyer, montantCharges, periodeLoyer);
});

// 🔁 Fonction de génération PDF utilisée par les deux routes
function generatePDF(doc, civilite, nomLocataire, adresseLocataire, montantLoyer, montantCharges, periodeLoyer) {
  const total = parseFloat(montantLoyer) + parseFloat(montantCharges);

  doc.fontSize(18).text('Quittance de Loyer', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Je soussigné, Sébastien Lile, propriétaire du logement situé au :`);
  doc.text(`535 Grande Rue, 78955 Carrières-sous-Poissy,`);
  doc.text(`déclare avoir reçu de la part de :`);
  doc.moveDown();
  doc.text(`  • Nom du locataire : ${civilite} ${nomLocataire}`);
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
  doc.text('Sébastien Lile');

  const signaturePath = path.join(__dirname, 'signature.png');
  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, {
      fit: [120, 60],
      align: 'right',
      valign: 'bottom'
    });
  }

  doc.end();
}

app.listen(5000, () => console.log('✅ Serveur démarré sur le port 5000'));