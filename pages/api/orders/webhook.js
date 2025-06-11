import { database } from '../../../src/firebase/firebase';
import { ref, set } from 'firebase/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, orderAmount, referenceId, paymentStatus, customerDetails } = req.body;

    if (!orderId || !paymentStatus) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Extract product ID from orderId (format: order_[productId]_[timestamp])
    const productId = orderId.split('_')[1];
    const userId = customerDetails.customer_id.replace('cust_', '');

    if (paymentStatus === 'SUCCESS') {
      // Record purchase in Firebase
      const purchaseRef = ref(database, `users/${userId}/purchasedCourses/${productId}`);
      await set(purchaseRef, {
        productId,
        orderId,
        amount: orderAmount,
        paymentId: referenceId,
        timestamp: Date.now(),
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
