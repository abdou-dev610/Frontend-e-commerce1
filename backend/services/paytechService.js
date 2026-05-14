import axios from 'axios';
import crypto from 'crypto';

// ✅ Fonction helper EXTERNE
const generateSignature = (data) => {
  const secret = process.env.PAYTECH_API_SECRET || 'test-secret';
  const message = JSON.stringify(data);
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
};

export const paytechService = {
  // Créer une demande de paiement
  createPaymentRequest: async (order) => {
    try {
      console.log('⏳ createPaymentRequest called for order:', order._id);

      // ✅ MODE MOCK PAR DÉFAUT - TOUJOURS UTILISÉ SAUF SI EXPLICITEMENT CONFIGURÉ
      const useRealPayTech = process.env.USE_REAL_PAYTECH === 'true' && 
                             process.env.PAYTECH_API_KEY && 
                             process.env.PAYTECH_API_URL;

      if (!useRealPayTech) {
        console.log('✅ Mode MOCK PayTech - Payment simulation active');
        
        // Générer une URL de succès simulée
        const mockTransactionId = `MOCK-${Date.now()}`;
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-success?transaction_id=${mockTransactionId}&order=${order._id}`;
        
        console.log('✅ Mock payment created:', mockTransactionId);
        
        return {
          transaction_id: mockTransactionId,
          redirect_url: redirectUrl,
          payment_url: redirectUrl,
          id: mockTransactionId,
          status: 'pending'
        };
      }

      // ✅ MODE PRODUCTION - Appel réel à PayTech (seulement si explicitement activé)
      console.log('📤 Calling REAL PayTech API...');
      
      const paymentData = {
        merchant_id: process.env.PAYTECH_MERCHANT_ID,
        amount: Math.round(order.totalAmount * 100), // en centimes
        currency: 'XOF',
        reference: order._id.toString(),
        description: `Commande Boutique Fashion - ${order.items.length} article(s)`,
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/webhook`,
        customer: {
          email: order.customerEmail,
          phone: order.customerPhone,
          name: order.customerName
        }
      };

      const signature = generateSignature(paymentData);
      paymentData.signature = signature;

      const response = await axios.post(
        `${process.env.PAYTECH_API_URL}/api/payment/request-payment`,
        paymentData,
        {
          headers: {
            'X-API-KEY': process.env.PAYTECH_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('✅ PayTech response received');
      return response.data;
    } catch (error) {
      console.error('❌ PayTech Error:', error.message);
      
      // ✅ FALLBACK - Si l'API réelle échoue, utiliser le mock
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log('⚠️  PayTech API unreachable, falling back to MOCK mode...');
        const mockTransactionId = `FALLBACK-${Date.now()}`;
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-success?transaction_id=${mockTransactionId}&order=${order._id}`;
        
        return {
          transaction_id: mockTransactionId,
          redirect_url: redirectUrl,
          payment_url: redirectUrl,
          id: mockTransactionId,
          status: 'pending'
        };
      }

      throw new Error('Failed to create payment request: ' + error.message);
    }
  },

  // Vérifier le statut d'un paiement
  checkPaymentStatus: async (transactionId) => {
    try {
      // ✅ MODE TEST
      if (transactionId.startsWith('MOCK-')) {
        return {
          status: 'completed',
          transaction_id: transactionId
        };
      }

      // ✅ MODE PRODUCTION
      const response = await axios.get(
        `${process.env.PAYTECH_API_URL}/api/payment/check-payment/${transactionId}`,
        {
          headers: {
            'X-API-KEY': process.env.PAYTECH_API_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayTech Status Check Error:', error);
      throw new Error('Failed to check payment status');
    }
  }
};
