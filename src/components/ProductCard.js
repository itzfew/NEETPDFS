import { useState } from 'react';
import Link from 'next/link';
import { auth, database } from '../firebase/firebaseConfig';
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
  const router = useRouter();

  const handleBuyNow = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to purchase');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const userRef = ref(database, `users/${auth.currentUser.uid}/purchasedCourses/${product.id}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        toast.info('You already purchased this course');
        router.push('/courses/view?product=' + product.id);
        return;
      }

      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: product.price, productId: product.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { order_id, payment_session_id } = await response.json();

      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not loaded');
      }

      const cashfree = new window.Cashfree({
        env: process.env.NEXT_PUBLIC_CASHFREE_ENV,
      });

      cashfree
        .checkout({
          paymentSessionId: payment_session_id,
          returnUrl: `${window.location.origin}/courses/view?product=${product.id}`,
        })
        .then(async () => {
          await set(userRef, {
            productId: product.id,
            orderId: order_id,
            timestamp: Date.now(),
          });
          toast.success('Course purchased successfully!');
          router.push('/courses/view?product=' + product.id);
        })
        .catch((error) => {
          toast.error('Payment failed: ' + error.message);
        });
    } catch (error) {
      toast.error('Payment error: ' + error.message);
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
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
