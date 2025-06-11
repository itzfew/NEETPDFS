// pages/api/orders/create.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, productId } = req.body;

  if (!amount || !productId) {
    return res.status(400).json({ error: 'Amount and productId are required' });
  }

  try {
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_API_SECRET,
      },
      body: JSON.stringify({
        order_id: `order_${productId}_${Date.now()}`,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_email: 'user@example.com',
          customer_phone: '9999999999',
        },
        order_meta: {
          return_url: `${req.headers.origin}/courses/view?product=${productId}`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
}
