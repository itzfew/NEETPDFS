import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  const { amount, productId } = req.body;

  if (!amount || !productId) {
    return res.status(400).json({ 
      success: false,
      error: 'Amount and productId are required' 
    });
  }

  try {
    const cashfreeResponse = await fetch('https://api.cashfree.com/pg/orders', {
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
          return_url: `${req.headers.origin}/courses/view?product=${productId}&status=:payment_status`,
          notify_url: `${req.headers.origin}/api/orders/webhook`,
        },
      }),
    });

    const responseData = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error('Cashfree API Error:', responseData);
      throw new Error(responseData.message || 'Failed to create order');
    }

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error creating order:', error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create order' 
    });
  }
}
