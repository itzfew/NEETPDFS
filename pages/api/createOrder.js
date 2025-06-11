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
          customer_email: 'user@example.com', // Replace with dynamic user email if available
          customer_phone: '9999999999', // Replace with dynamic user phone if available
        },
        order_meta: {
          return_url: `${req.headers.origin}/courses/view?product=${productId}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const { order_id, payment_session_id } = await response.json();
    res.status(200).json({ order_id, payment_session_id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}
