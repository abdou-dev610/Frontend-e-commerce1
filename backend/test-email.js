#!/usr/bin/env node
import { testEmailConnection, sendWelcomeEmail, sendCustomerConfirmationEmail, sendAdminNotificationEmail, sendOrderStatusUpdateEmail } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST DE CONFIGURATION EMAIL - Chic Senegal Style');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Connexion Email
    console.log('📧 Test 1: Test de Connexion Email');
    console.log('-'.repeat(60));
    try {
      const test1 = await testEmailConnection();
      console.log('✅ SUCCÈS: Connexion email fonctionnelle!');
      console.log('Message ID:', test1.messageId);
    } catch (error) {
      console.error('❌ ERREUR: Impossible de se connecter à Gmail');
      console.error('Vérifiez:');
      console.error('  1. GMAIL_USER dans .env');
      console.error('  2. GMAIL_APP_PASSWORD dans .env');
      console.error('  3. Double authentification activée sur Gmail');
      console.error('Détail:', error.message);
    }

    // Test 2: Email de Bienvenue
    console.log('\n📧 Test 2: Email de Bienvenue (Signup)');
    console.log('-'.repeat(60));
    try {
      const test2 = await sendWelcomeEmail({
        email: process.env.ADMIN_EMAIL,
        fullName: 'Test Utilisateur'
      });
      if (test2.success) {
        console.log('✅ SUCCÈS: Email de bienvenue envoyé!');
        console.log('À:', process.env.ADMIN_EMAIL);
        console.log('Message ID:', test2.messageId);
      } else {
        console.error('❌ ERREUR:', test2.error);
      }
    } catch (error) {
      console.error('❌ ERREUR:', error.message);
    }

    // Test 3: Email de Confirmation Client
    console.log('\n📧 Test 3: Email de Confirmation de Paiement (Client)');
    console.log('-'.repeat(60));
    try {
      const test3 = await sendCustomerConfirmationEmail({
        orderNumber: 'CMD-20260413-97878',
        customerName: 'Test Client',
        customerEmail: process.env.ADMIN_EMAIL,
        customerPhone: '76 204 81 19',
        totalAmount: 175000,
        items: [
          {
            name: 'Robe Abaya Traditionnelle x5',
            productName: 'Robe Abaya Traditionnelle',
            quantity: 1,
            price: 175000
          }
        ],
        transactionId: 'TXN-20260413-12345',
        paymentMethod: 'PayTech'
      });
      if (test3.success) {
        console.log('✅ SUCCÈS: Email de confirmation client envoyé!');
        console.log('À:', process.env.ADMIN_EMAIL);
        console.log('Message ID:', test3.messageId);
      } else {
        console.error('❌ ERREUR:', test3.error);
      }
    } catch (error) {
      console.error('❌ ERREUR:', error.message);
    }

    // Test 4: Email de Notification Admin
    console.log('\n📧 Test 4: Email de Notification Admin (Paiement)');
    console.log('-'.repeat(60));
    try {
      const test4 = await sendAdminNotificationEmail({
        orderNumber: 'CMD-20260413-97878',
        customerName: 'Test Client',
        customerEmail: 'test@example.com',
        customerPhone: '76 204 81 19',
        totalAmount: 175000,
        items: [
          {
            name: 'Robe Abaya Traditionnelle x5',
            productName: 'Robe Abaya Traditionnelle',
            quantity: 1,
            price: 175000
          }
        ],
        transactionId: 'TXN-20260413-12345'
      });
      if (test4.success) {
        console.log('✅ SUCCÈS: Email de notification admin envoyé!');
        console.log('À:', process.env.ADMIN_EMAIL);
        console.log('Message ID:', test4.messageId);
      } else {
        console.error('❌ ERREUR:', test4.error);
      }
    } catch (error) {
      console.error('❌ ERREUR:', error.message);
    }

    // Test 5: Email de Notification de Changement de Statut (Confirmé)
    console.log('\n📧 Test 5: Email de Notification de Changement de Statut - CONFIRMÉE');
    console.log('-'.repeat(60));
    try {
      const test5 = await sendOrderStatusUpdateEmail({
        customerEmail: process.env.ADMIN_EMAIL,
        customerName: 'Test Client',
        orderNumber: 'CMD-20260413-97878',
        totalAmount: 175000,
        items: [
          {
            name: 'Robe Abaya Traditionnelle',
            productName: 'Robe Abaya Traditionnelle',
            quantity: 1,
            price: 175000
          }
        ],
        orderStatus: 'confirmed',
        paymentStatus: 'completed'
      });
      if (test5.success) {
        console.log('✅ SUCCÈS: Email de notification de statut (Confirmée) envoyé!');
        console.log('À:', process.env.ADMIN_EMAIL);
        console.log('Message ID:', test5.messageId);
      } else {
        console.error('❌ ERREUR:', test5.error);
      }
    } catch (error) {
      console.error('❌ ERREUR:', error.message);
    }

    // Test 6: Email de Notification de Changement de Statut (Livrée)
    console.log('\n📧 Test 6: Email de Notification de Changement de Statut - LIVRÉE');
    console.log('-'.repeat(60));
    try {
      const test6 = await sendOrderStatusUpdateEmail({
        customerEmail: process.env.ADMIN_EMAIL,
        customerName: 'Test Client',
        orderNumber: 'CMD-20260413-97878',
        totalAmount: 175000,
        items: [
          {
            name: 'Robe Abaya Traditionnelle',
            productName: 'Robe Abaya Traditionnelle',
            quantity: 1,
            price: 175000
          }
        ],
        orderStatus: 'delivered',
        paymentStatus: 'completed'
      });
      if (test6.success) {
        console.log('✅ SUCCÈS: Email de notification de statut (Livrée) envoyé!');
        console.log('À:', process.env.ADMIN_EMAIL);
        console.log('Message ID:', test6.messageId);
      } else {
        console.error('❌ ERREUR:', test6.error);
      }
    } catch (error) {
      console.error('❌ ERREUR:', error.message);
    }

    // Test 7: Email de Notification de Changement de Statut (Annulée)
    console.log('\n📧 Test 7: Email de Notification de Changement de Statut - ANNULÉE');
    console.log('-'.repeat(60));
    try {
      const test7 = await sendOrderStatusUpdateEmail({
        customerEmail: process.env.ADMIN_EMAIL,
        customerName: 'Test Client',
        orderNumber: 'CMD-20260413-97878',
        totalAmount: 175000,
        items: [
          {
            name: 'Robe Abaya Traditionnelle',
            productName: 'Robe Abaya Traditionnelle',
            quantity: 1,
            price: 175000
          }
        ],
        orderStatus: 'cancelled',
        paymentStatus: 'completed'
      });
      if (test7.success) {
        console.log('✅ SUCCÈS: Email de notification de statut (Annulée) envoyé!');
        console.log('À:', process.env.ADMIN_EMAIL);
        console.log('Message ID:', test7.messageId);
      } else {
        console.error('❌ ERREUR:', test7.error);
      }
    } catch (error) {
      console.error('❌ ERREUR:', error.message);
    }

    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTS TERMINÉS');
    console.log('='.repeat(60));
    console.log('\n📝 Résumé des tests:');
    console.log('  Test 1: Connexion Email');
    console.log('  Test 2: Email de Bienvenue (Signup)');
    console.log('  Test 3: Email de Confirmation de Paiement (Client)');
    console.log('  Test 4: Email de Notification Admin (Paiement)');
    console.log('  Test 5: Email de Notification - Statut CONFIRMÉE');
    console.log('  Test 6: Email de Notification - Statut LIVRÉE');
    console.log('  Test 7: Email de Notification - Statut ANNULÉE');
    console.log('\n📊 Résultats:');
    console.log('  • Les emails sont envoyés à:', process.env.ADMIN_EMAIL);
    console.log('  • Vérifiez votre boîte mail (y compris Spam/Promotions)');
    console.log('  • Si aucun email n\'arrive, consultez EMAIL_CONFIG_GUIDE.md\n');

  } catch (error) {
    console.error('\n❌ ERREUR GÉNÉRALE:', error.message);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
