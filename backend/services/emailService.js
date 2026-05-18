import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurer le transporteur Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || process.env.ADMIN_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

/**
 * Envoyer un email de confirmation au CLIENT après paiement
 */
export const sendCustomerConfirmationEmail = async (orderData) => {
  try {
    console.log('📧 Envoi email de confirmation au client...');

    const {
      customerEmail,
      customerName,
      orderNumber,
      totalAmount,
      items = [],
      paymentMethod,
      transactionId
    } = orderData;

    // Créer la liste des articles
    const itemsHtml = items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name || item.productName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price.toLocaleString()} FCFA</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price * item.quantity).toLocaleString()} FCFA</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .section { margin: 20px 0; }
            .section-title { font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .total-row { background: #f9fafb; font-weight: bold; }
            .success-message { background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px; color: #166534; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            .button { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- En-tête -->
            <div class="header">
              <h1>✅ Paiement Réussi!</h1>
              <p>Votre commande a été confirmée et l'administrateur en a été notifié.</p>
            </div>

            <!-- Message de succès -->
            <div class="success-message">
              <strong>Merci pour votre achat!</strong> Nous traitons votre commande et vous l'enverrons bientôt.
            </div>

            <!-- Détails de la commande -->
            <div class="section">
              <div class="section-title">📦 Détails de la Commande</div>
              <p><strong>Numéro de commande:</strong> ${orderNumber}</p>
              <p><strong>Nom:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Méthode de paiement:</strong> ${paymentMethod || 'PayTech'}</p>
              <p><strong>ID de transaction:</strong> ${transactionId || 'N/A'}</p>
            </div>

            <!-- Résumé des articles -->
            <div class="section">
              <div class="section-title">🛍️ Résumé des Articles</div>
              <table>
                <thead>
                  <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: center;">Quantité</th>
                    <th style="padding: 10px; text-align: right;">Prix unitaire</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 10px; text-align: right;">TOTAL:</td>
                    <td style="padding: 10px; text-align: right;">${totalAmount.toLocaleString()} FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Prochaines étapes -->
            <div class="section">
              <div class="section-title">📋 Prochaines Étapes</div>
              <ol>
                <li>Nous vérifions votre commande</li>
                <li>Nous préparons votre colis</li>
                <li>Nous vous enverrons un email de suivi</li>
                <li>Votre commande vous sera livrée</li>
              </ol>
            </div>

            <!-- Actions -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/commandes" class="button">
                Suivre ma commande
              </a>
            </div>

            <!-- Contact -->
            <div class="section">
              <div class="section-title">💬 Besoin d'aide?</div>
              <p>Si vous avez des questions, contactez-nous:</p>
              <p>📧 Email: <strong>${process.env.ADMIN_EMAIL}</strong></p>
              <p>📞 WhatsApp: <strong>${process.env.WHATSAPP_NUMBER}</strong></p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>© 2026 Chic Senegal Style. Tous droits réservés.</p>
              <p>Ne répondez pas directement à cet email. Utilisez le formulaire de contact.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: customerEmail,
      subject: `✅ Paiement Réussi - Commande #${orderNumber}`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email client envoyé avec succès:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email client:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de notification à l'ADMIN
 */
export const sendAdminNotificationEmail = async (orderData) => {
  try {
    console.log('📧 Envoi notification à l\'administrateur...');

    const {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      items = [],
      transactionId
    } = orderData;

    // Créer la liste des articles
    const itemsHtml = items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name || item.productName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price * item.quantity).toLocaleString()} FCFA</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .section { margin: 20px 0; }
            .section-title { font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .total-row { background: #f0fdf4; font-weight: bold; }
            .action-button { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Nouvelle Commande Payée!</h1>
              <p>Une commande a été complètement payée et doit être traitée.</p>
            </div>

            <div class="section">
              <div class="section-title">👤 Informations Client</div>
              <p><strong>Nom:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Téléphone:</strong> ${customerPhone}</p>
            </div>

            <div class="section">
              <div class="section-title">📦 Détails de la Commande</div>
              <p><strong>Numéro:</strong> ${orderNumber}</p>
              <p><strong>ID Transaction:</strong> ${transactionId}</p>
              <p><strong>Montant Total:</strong> <span style="color: #22c55e; font-size: 18px; font-weight: bold;">${totalAmount.toLocaleString()} FCFA</span></p>
            </div>

            <div class="section">
              <div class="section-title">🛍️ Articles Commandés</div>
              <table>
                <thead>
                  <tr style="background: #f0fdf4;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: center;">Quantité</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 10px; text-align: right;">TOTAL:</td>
                    <td style="padding: 10px; text-align: right;">${totalAmount.toLocaleString()} FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/admin" class="action-button">
                Voir dans le tableau de bord
              </a>
            </div>

            <div class="footer">
              <p>© 2026 Chic Senegal Style - Tableau de bord Admin</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `🎯 Nouvelle Commande Payée - #${orderNumber} (${totalAmount.toLocaleString()} FCFA)`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email admin envoyé avec succès:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email admin:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de bienvenue à l'inscription
 */
export const sendWelcomeEmail = async (userData) => {
  try {
    console.log('📧 Envoi email de bienvenue...');

    const { email, fullName } = userData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .section { margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue!</h1>
              <p>Votre compte a été créé avec succès</p>
            </div>

            <p>Bonjour <strong>${fullName}</strong>,</p>

            <div class="section">
              <p>Merci de vous être inscrit sur <strong>Chic Senegal Style</strong>! 🇸🇳</p>
              <p>Votre compte est maintenant actif et vous pouvez:</p>
              <ul>
                <li>✅ Parcourir nos produits</li>
                <li>✅ Faire vos achats</li>
                <li>✅ Suivre vos commandes</li>
                <li>✅ Gérer votre profil</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/produits" class="button">
                Découvrir nos produits
              </a>
            </div>

            <div class="section">
              <p>Des questions? Contactez-nous à <strong>${process.env.ADMIN_EMAIL}</strong></p>
            </div>

            <div class="footer">
              <p>© 2026 Chic Senegal Style. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `🎉 Bienvenue sur Chic Senegal Style, ${fullName}!`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de bienvenue envoyé:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email bienvenue:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer une notification de changement de statut de commande au CLIENT
 */
export const sendOrderStatusUpdateEmail = async (orderData) => {
  try {
    console.log('📧 Envoi notification de changement de statut au client...');

    const {
      customerEmail,
      customerName,
      orderNumber,
      totalAmount,
      items = [],
      orderStatus,
      paymentStatus
    } = orderData;

    // Déterminer le message et la couleur selon le statut
    let statusMessage = '';
    let statusEmoji = '';
    let statusColor = '#007bff';
    let backgroundColor = '#e7f3ff';

    if (orderStatus === 'confirmed') {
      statusMessage = 'Votre commande a été <strong>confirmée</strong> par notre équipe. Elle est maintenant en cours de préparation. Vous serez informé(e) dès qu\'elle sera expédiée.';
      statusEmoji = '✓ Confirmée';
      statusColor = '#16a34a';
      backgroundColor = '#dcfce7';
    } else if (orderStatus === 'shipped') {
      statusMessage = 'Votre commande a été <strong>expédiée</strong> ! 🚚 Elle est en route vers vous. Préparez-vous à la recevoir très prochainement.';
      statusEmoji = '🚚 Expédiée';
      statusColor = '#2563eb';
      backgroundColor = '#dbeafe';
    } else if (orderStatus === 'delivered') {
      statusMessage = 'Votre commande a été <strong>livrée</strong> avec succès ! 📦 Nous espérons que vous êtes satisfait(e) de votre achat. N\'hésitez pas à nous contacter si vous avez des questions.';
      statusEmoji = '📦 Livrée';
      statusColor = '#8B5E3C';
      backgroundColor = '#fdf3e8';
    } else if (orderStatus === 'cancelled') {
      statusMessage = 'Nous regrettons de vous informer que votre commande a été <strong>annulée</strong>. Si vous pensez qu\'il s\'agit d\'une erreur ou souhaitez plus d\'informations, n\'hésitez pas à nous contacter.';
      statusEmoji = '❌ Annulée';
      statusColor = '#dc2626';
      backgroundColor = '#fee2e2';
    }

    // Créer la liste des articles
    const itemsHtml = items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name || item.productName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price * item.quantity).toLocaleString()} FCFA</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .status-box { background: ${backgroundColor}; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 4px; color: ${statusColor}; font-weight: bold; }
            .section { margin: 20px 0; }
            .section-title { font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .total-row { background: #f9fafb; font-weight: bold; }
            .button { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- En-tête -->
            <div class="header">
              <h1>📦 Mise à jour de votre commande</h1>
              <p>Le statut de votre commande a changé</p>
            </div>

            <!-- Notification de statut -->
            <div class="status-box">
              ${statusEmoji}: ${statusMessage}
            </div>

            <!-- Détails de la commande -->
            <div class="section">
              <div class="section-title">📋 Détails de votre commande</div>
              <p><strong>Numéro de commande:</strong> ${orderNumber}</p>
              <p><strong>Montant total:</strong> ${totalAmount.toLocaleString()} FCFA</p>
              <p><strong>Statut de paiement:</strong> ${paymentStatus === 'completed' ? '✅ Confirmé' : '⏳ En attente'}</p>
              <p><strong>Statut de commande:</strong> ${statusEmoji}</p>
            </div>

            <!-- Résumé des articles -->
            <div class="section">
              <div class="section-title">🛍️ Articles commandés</div>
              <table>
                <thead>
                  <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: center;">Quantité</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 10px; text-align: right;">TOTAL:</td>
                    <td style="padding: 10px; text-align: right;">${totalAmount.toLocaleString()} FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Actions -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/commandes" class="button">
                Suivre ma commande
              </a>
            </div>

            <!-- Contact -->
            <div class="section">
              <div class="section-title">💬 Besoin d'aide?</div>
              <p>Si vous avez des questions concernant votre commande, contactez-nous:</p>
              <p>📧 Email: <strong>${process.env.ADMIN_EMAIL}</strong></p>
              <p>📞 WhatsApp: <strong>${process.env.WHATSAPP_NUMBER}</strong></p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>© 2026 Chic Senegal Style. Tous droits réservés.</p>
              <p>Ne répondez pas directement à cet email. Utilisez le formulaire de contact.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: customerEmail,
      subject: `📦 Mise à jour de votre commande #${orderNumber} - ${statusEmoji}`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de notification envoyé au client:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email de notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Tester la connexion email
 */
export const testEmailConnection = async () => {
  try {
    console.log('🧪 Test de la connexion email...');

    const testEmail = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: '🧪 Test email - Chic Senegal Style',
      html: `
        <h2>✅ Configuration Email Fonctionnelle!</h2>
        <p>Votre service d'emails est correctement configuré.</p>
        <p><strong>Email Admin:</strong> ${process.env.ADMIN_EMAIL}</p>
        <p><strong>Heure du test:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Email de test envoyé avec succès!', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erreur test email:', error.message);
    throw error;
  }
};

export const sendVerificationEmail = async ({ email, fullName, verifyUrl }) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;background:#f8f7f4;padding:20px">
          <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#1a0a00,#7c3a10);padding:30px;text-align:center">
              <h1 style="color:white;margin:0;font-size:22px">🛍️ Chic Senegal Style</h1>
            </div>
            <div style="padding:32px">
              <h2 style="color:#1f2937">Vérifiez votre adresse email</h2>
              <p style="color:#4b5563">Bonjour <strong>${fullName || 'cher client'}</strong>,</p>
              <p style="color:#4b5563">Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour vérifier votre email :</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${verifyUrl}" style="background:linear-gradient(90deg,#b45309,#f97316);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">
                  ✅ Vérifier mon email
                </a>
              </div>
              <p style="color:#6b7280;font-size:13px">Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
              <p style="color:#9ca3af;font-size:12px;text-align:center">© 2026 Chic Senegal Style</p>
            </div>
          </div>
        </body>
      </html>
    `;
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: '✅ Vérifiez votre email - Chic Senegal Style',
      html
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur email vérification:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendCustomerConfirmationEmail,
  sendAdminNotificationEmail,
  sendOrderStatusUpdateEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  testEmailConnection
};

