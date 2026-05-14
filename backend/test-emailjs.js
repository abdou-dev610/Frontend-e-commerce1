#!/usr/bin/env node

/**
 * 🧪 Test EmailJS Configuration Script
 * 
 * Vérifie la configuration EmailJS et envoie un email de test
 * 
 * Usage: node test-emailjs.js
 */

import emailjs from '@emailjs/nodejs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

console.log(`📁 Loading .env from: ${envPath}\n`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ .env file not found');
  process.exit(1);
}

// Configuration
const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

console.log('═══════════════════════════════════════════════════════');
console.log('🧪 EMAILJS CONFIGURATION TEST');
console.log('═══════════════════════════════════════════════════════\n');

// Vérifier les variables
console.log('📋 Vérification des variables d\'environnement:');
console.log(`   SERVICE_ID: ${SERVICE_ID ? '✅' : '❌'}`);
console.log(`   TEMPLATE_ID: ${TEMPLATE_ID ? '✅' : '❌'}`);
console.log(`   PUBLIC_KEY: ${PUBLIC_KEY ? '✅' : '❌'}`);
console.log(`   ADMIN_EMAIL: ${ADMIN_EMAIL ? '✅' : '❌'}`);
console.log('');

if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !ADMIN_EMAIL) {
  console.error('❌ Variables EmailJS incomplètes dans .env');
  process.exit(1);
}

// Initialize EmailJS
emailjs.init({
  publicKey: PUBLIC_KEY,
  limitRate: {
    id: 'positive',
    throttle: 5000,
  }
});

// Test EmailJS
async function testEmailJS() {
  try {
    console.log('🔌 Test de connexion EmailJS...\n');
    
    const testParams = {
      to_email: ADMIN_EMAIL,
      order_number: 'TEST-EMAILJS-001',
      order_id: 'test_emailjs_id',
      transaction_id: 'test_transaction_123',
      customer_name: 'Test Admin EmailJS',
      customer_email: ADMIN_EMAIL,
      customer_phone: '76 204 81 19',
      total_amount: '50,000',
      items_list: 'Email de Test EmailJS\nConfiguration Réussie',
      admin_dashboard_link: 'http://localhost:8080/admin'
    };

    console.log('📧 Envoi d\'un email de test...\n');
    console.log('Paramètres:');
    console.log(`   Service: ${SERVICE_ID}`);
    console.log(`   Template: ${TEMPLATE_ID}`);
    console.log(`   Email destination: ${ADMIN_EMAIL}`);
    console.log('');

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, testParams);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ EMAIL EMAILJS ENVOYÉ AVEC SUCCÈS!\n');
    console.log('📧 Détails:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Email destinataire: ${ADMIN_EMAIL}`);
    console.log(`   Template utilisé: ${TEMPLATE_ID}`);
    console.log('\n═══════════════════════════════════════════════════════');
    
    console.log('\n✨ Prochaines Étapes:');
    console.log('   1. Vérifiez votre email reçu');
    console.log('   2. Votre configuration EmailJS fonctionne parfaitement');
    console.log('   3. Les notifications de commandes seront envoyées automatiquement');
    console.log('   4. Les emails seront au format défini dans votre template EmailJS');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR EMAILJS\n');
    console.error('Détails de l\'erreur:');
    console.error(`   Message: ${error.message}`);
    console.error('\n');

    // Diagnostic spécifique
    if (error.message.includes('Service') || error.message.includes('invalid')) {
      console.error('🔴 Problème: Service ID ou Template ID invalide\n');
      console.error('Vérifiez:');
      console.error('   1. Service ID: ' + SERVICE_ID);
      console.error('   2. Template ID: ' + TEMPLATE_ID);
      console.error('   3. Public Key: ' + PUBLIC_KEY.substring(0, 10) + '...');
      console.error('\n   Ces valeurs doivent correspondre à votre compte EmailJS');
      console.error('   Allez sur: https://dashboard.emailjs.com/');
    } else if (error.message.includes('Network') || error.message.includes('ENOTFOUND')) {
      console.error('🔴 Problème: Erreur de connexion réseau\n');
      console.error('Vérifiez votre connexion Internet');
    } else {
      console.error('🔴 Erreur inattendue\n');
      console.error('Consultez les logs complètement ci-dessus');
    }

    console.error('\n═══════════════════════════════════════════════════════');
    process.exit(1);
  }
}

// Run test
testEmailJS();
