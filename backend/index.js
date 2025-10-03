const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// 🌍 Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://quittances-frontend.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// 📧 Transport mail (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sebastien95360@gmail.com',
    pass: 'knrwbqjkjfmqgezy' // ⚠️ à déplacer dans .env
  }
});

// 📤 Route unique pour ENVOYER une quittance par mail
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

  // ✅ Validation des champs
  if (!civilite || !emailLocataire || !nomLocataire || !adresseLocataire || !montantLoyer || !montantCharges || !datePaiement || !periodeLoyer) {
    return res.status(400).send("❌ Champs manquants dans la requête.");
  }

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
        <p>Veuillez trouver ci-joint votre quittance de loyer pour la période <strong>${periodeLoyer}</strong>.</p>
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
        console.error('❌ Erreur d’envoi du mail :', error);
        return res.status(500).send("Erreur lors de l'envoi de la quittance.");
      }

      console.log('📩 Quittance envoyée :', info.response);
      res.status(200).send('✅ Quittance PDF envoyée avec succès.');
    });
  });

  // 🔁 Génération du PDF
  generatePDF(doc, civilite, nomLocataire, adresseLocataire, montantLoyer, montantCharges, periodeLoyer);
});

// 🧾 Fonction de génération du PDF
function generatePDF(doc, civilite, nomLocataire, adresseLocataire, montantLoyer, montantCharges, periodeLoyer) {
  const total = parseFloat(montantLoyer) + parseFloat(montantCharges);

  doc.fontSize(20).font('Helvetica-Bold').text('QUITTANCE DE LOYER', { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(12).font('Helvetica');
  doc.text('Je soussigné, Sébastien Lile, propriétaire du logement situé au :');
  doc.text('535 Grande Rue, 78955 Carrières-sous-Poissy.');
  doc.moveDown();

  doc.text('Déclare avoir reçu de la part de :');
  doc.moveDown();

  doc.text(`• Nom du locataire      : ${civilite} ${nomLocataire}`);
  doc.text(`• Adresse du locataire  : ${adresseLocataire}`);
  doc.moveDown();

  doc.text(`Paiement du loyer pour la période : ${periodeLoyer}`);
  doc.moveDown();

  doc.text(`• Montant du loyer      : ${montantLoyer} €`);
  doc.text(`• Montant des charges   : ${montantCharges} €`);
  doc.font('Helvetica-Bold');
  doc.text(`• Total payé            : ${total} €`);
  doc.font('Helvetica');
  doc.moveDown(2);

  doc.text(`Fait le : ${new Date().toLocaleDateString('fr-FR')}`);
  doc.moveDown(2);
  doc.text('Signature : Sébastien Lile');

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

// ✅ Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});