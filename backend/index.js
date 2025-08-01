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
  const {
    emailLocataire,
    nomLocataire,
    adresseLocataire,
    montantLoyer,
    montantCharges,
    datePaiement
  } = req.body;

  const total = parseFloat(montantLoyer) + parseFloat(montantCharges);

  const doc = new PDFDocument();
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);

    const mailOptions = {
      from: sebastien95360@gmail;com,
      to: emailLocataire,
      subject: 'Quittance de Loyer',
      html: `<p>Veuillez trouver ci-joint votre quittance de loyer.</p>`,
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
        return res.status(500).send("Erreur lors de l'envoi.");
      }
      res.status(200).send('Quittance PDF envoyée avec succès.');
    });
  });

  // 🔽 Génération du contenu PDF avec ton modèle
  doc.fontSize(12);
  doc.text(`Je soussigné, Sébastien Lile, propriétaire du logement situé au :`);
  doc.text(`535 Grande Rue, 78955 Carrières-sous-Poissy,`);
  doc.moveDown();
  doc.text(`déclare avoir reçu de la part de :`);
  doc.text(`  • Nom du locataire : ${nomLocataire}`);
  doc.text(`  • Adresse du locataire : ${adresseLocataire}`);
  doc.moveDown();
  doc.text(`Le paiement du loyer pour la période :`);
  doc.text(`  • Montant du loyer : ${montantLoyer} €`);
  doc.text(`  • Montant des charges : ${montantCharges} €`);
  doc.text(`  • Total payé : ${total} €`);
  doc.moveDown();
  doc.text(`Fait le : ${new Date().toLocaleDateString('fr-FR')}`);
  doc.moveDown(2);

  // 🔽 Signature texte + image
  doc.text('Sébastien Lile', { align: 'right' });

  const signaturePath = path.join(__dirname, 'signature.png'); // image dans backend/
  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, {
      fit: [120, 60],
      align: 'right',
      valign: 'bottom'
    });
  } else {
    console.warn('⚠️ Image de signature non trouvée à :', signaturePath);
  }

  doc.end();
});

app.listen(5000, () => console.log('Serveur démarré sur le port 5000'));