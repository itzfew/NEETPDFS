import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, database } from '../firebase/firebase';
import { ref, get, set } from 'firebase/database';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const Rating = ({ rating }) => {
  const stars = Array(5).fill(0).map((_, i) => (
    <i
      key={i}
      className={`fas fa-star ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
    ></i>
  ));
  return <div className="flex">{stars}</div>;
};

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (window.Cashfree) {
      setCashfreeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => setCashfreeLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBuyNow = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to purchase');
      router.push('/login');
      return;
    }

    if (!cashfreeLoaded) {
      toast.error('Payment system is loading, please try again in a moment');
      return;
    }

    setLoading(true);
    try {
      // Check if already purchased
      const userRef = ref(database, `users/${auth.currentUser.uid}/purchasedCourses/${product.id}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        toast.info('You already purchased this course');
        router.push(`/courses/view?product=${product.id}`);
        return;
      }

      // Create order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: product.price, 
          productId: product.id 
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to create order');
      }

      const { payment_session_id, order_id } = responseData.data;

      // Initialize Cashfree
      const cashfree = new window.Cashfree({
        mode: "production",
      });

      // Open checkout
      cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
        components: ["order-details", "card", "netbanking", "wallet", "upi", "paylater"],
      });

      // Note: The success handling will be done via the return_url
      // The webhook will handle the actual purchase recording

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <Link href={`/courses/view?product=${product.id}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <Rating rating={product.rating} />
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
          <button
            onClick={handleBuyNow}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            disabled={loading || !cashfreeLoaded}
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
