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

  // 🎨 En-tête
  doc.fillColor('#333')
    .fontSize(22)
    .text('📄 Quittance de Loyer', { align: 'center' })
    .moveDown(1);

  // 🏠 Propriétaire
  doc.fontSize(12).fillColor('#000');
  doc.text('🧾 Propriétaire : Sébastien Lile');
  doc.text('📍 Adresse : 535 Grande Rue, 78955 Carrières-sous-Poissy');
  doc.moveDown();

  // 👤 Locataire
  doc.font('Helvetica-Bold').text('👤 Locataire :', { underline: true });
  doc.font('Helvetica').text(`${civilite} ${nomLocataire}`);
  doc.text(adresseLocataire);
  doc.moveDown();

  // 📅 Période
  doc.font('Helvetica-Bold').text('📅 Période concernée :', { underline: true });
  doc.font('Helvetica').text(`${periodeLoyer}`);
  doc.moveDown();

  // 💰 Détail des paiements
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor('#ccc')
    .stroke();

  doc.moveDown();
  doc.font('Helvetica').text(`💶 Loyer : ${montantLoyer} €`);
  doc.text(`🔧 Charges : ${montantCharges} €`);
  doc.font('Helvetica-Bold').text(`💰 Total payé : ${total} €`);
  doc.font('Helvetica');
  doc.moveDown();

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor('#ccc')
    .stroke();

  // 📍 Date + Signature
  doc.moveDown(2);
  doc.text(`Fait à Carrières-sous-Poissy, le ${new Date().toLocaleDateString('fr-FR')}`);
  doc.moveDown(2);
  doc.text('Signature du propriétaire :', { continued: true });

  const signaturePath = path.join(__dirname, 'signature.png');
  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, {
      fit: [120, 60],
      align: 'right',
      valign: 'bottom'
    });
  } else {
    doc.moveDown().text('_______________________', { align: 'right' });
  }

  doc.end();
}

app.listen(5000, () => console.log('✅ Serveur démarré sur le port 5000'));