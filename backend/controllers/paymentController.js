import Order from '../models/Order.js';
import { paytechService } from '../services/paytechService.js';
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';

export const initiatePayment = async (req, res) => {
  try {
    console.log('\n🔥🔥🔥 INITIATE PAYMENT REQUEST 🔥🔥🔥');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { orderId, amount, paymentMethod, description } = req.body;

    console.log('Looking for order:', orderId);
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('✅ Order found:', order._id);

    // Verify ownership
    if (order.userId.toString() !== req.userId.toString()) {
      console.error('❌ Unauthorized - userId mismatch');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    console.log('✅ User authorized');

    // Update order with payment info and description if provided
    order.paymentMethod = paymentMethod;
    if (description) {
      order.description = description;
    }
    await order.save();
    console.log('✅ Order updated with payment method');

    // Create PayTech payment request
    console.log('⏳ Creating PayTech payment request...');
    const paymentRequest = await paytechService.createPaymentRequest(order);

    console.log('✅ Payment request created:', paymentRequest);

    // Update transaction ID
    order.transactionId = paymentRequest.transaction_id || paymentRequest.id;
    await order.save();

    console.log('🎉 Payment initiated successfully');
    
    return res.json({
      redirect_url: paymentRequest.redirect_url || paymentRequest.payment_url,
      transaction_id: paymentRequest.transaction_id || paymentRequest.id,
      paymentRequest
    });
  } catch (error) {
    console.error('\n❌❌❌ PAYMENT INITIATION ERROR ❌❌❌');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Full Error:', error);

    return res.status(500).json({ 
      message: 'Payment initiation failed: ' + error.message,
      error: error.message
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.transactionId) {
      return res.status(400).json({ message: 'No transaction for this order' });
    }

    // Vérifier le statut auprès de PayTech
    const paymentStatus = await paytechService.checkPaymentStatus(order.transactionId);

    // Mettre à jour le statut de la commande si le paiement est complété
    if (paymentStatus.status === 'completed') {
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      await order.save();
    }

    return res.json({
      paymentStatus: paymentStatus.status,
      orderStatus: order.orderStatus
    });
  } catch (error) {
    console.error('Check Payment Status Error:', error);
    return res.status(500).json({ message: 'Failed to check payment status' });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  try {
    console.log('\n🔥🔥🔥 PAYMENT WEBHOOK RECEIVED 🔥🔥🔥');
    console.log('Webhook Body:', JSON.stringify(req.body, null, 2));

    const { transaction_id, status, order_id } = req.body;

    if (!order_id) {
      console.error('❌ Missing order_id in webhook');
      return res.status(400).json({ message: 'Missing order_id' });
    }

    console.log('Looking for order:', order_id);
    const order = await Order.findById(order_id);
    if (!order) {
      console.error('❌ Order not found:', order_id);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('✅ Order found:', order._id);
    console.log('Current payment status:', order.paymentStatus);
    console.log('Webhook status:', status);

    // Mettre à jour le statut de paiement
    if (status === 'completed' || status === 'success') {
      console.log('✅ Payment completed via webhook');
      
      const previousPaymentStatus = order.paymentStatus;
      const previousOrderStatus = order.orderStatus;
      
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.transactionId = transaction_id || order.transactionId;
      order.updatedAt = new Date();
      
      await order.save();

      console.log(`💾 Updated statuses: paymentStatus ${previousPaymentStatus}→${order.paymentStatus}, orderStatus ${previousOrderStatus}→${order.orderStatus}`);

      // Préparer les données pour l'email
      const emailData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName || 'Client',
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || '',
        totalAmount: order.totalAmount || 0,
        items: order.items || [],
        transactionId: transaction_id || order.transactionId,
        paymentMethod: order.paymentMethod || 'PayTech'
      };

      // Envoyer email au client
      try {
        console.log('📧 Sending customer confirmation email...');
        await sendCustomerConfirmationEmail(emailData);
        console.log('✅ Customer email sent');
      } catch (emailError) {
        console.warn('⚠️ Error sending customer email:', emailError.message);
      }

      // Envoyer email à l'admin
      try {
        console.log('📧 Sending admin notification email...');
        await sendAdminNotificationEmail(emailData);
        console.log('✅ Admin email sent');
      } catch (emailError) {
        console.warn('⚠️ Error sending admin email:', emailError.message);
      }

    } else if (status === 'failed' || status === 'error') {
      console.log('❌ Payment failed via webhook');
      order.paymentStatus = 'failed';
      order.updatedAt = new Date();
      await order.save();
      console.log('Updated payment status to failed for order:', order_id);
    } else if (status === 'pending') {
      console.log('⏳ Payment pending via webhook');
      order.paymentStatus = 'pending';
      order.updatedAt = new Date();
      await order.save();
      console.log('Updated payment status to pending for order:', order_id);
    }

    console.log('✅ Webhook processed successfully');
    return res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('\n❌❌❌ WEBHOOK HANDLING ERROR ❌❌❌');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    return res.status(500).json({ 
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};
