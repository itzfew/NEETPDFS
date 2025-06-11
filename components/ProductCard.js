import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ProductCard({ course }) {
  const router = useRouter();
  const { user } = useAuth();
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const checkPurchase = async () => {
      if (user) {
        const purchaseRef = doc(db, 'purchases', `${user.uid}_${course.name}`);
        const purchaseSnap = await getDoc(purchaseRef);
        setHasPurchased(purchaseSnap.exists());
      }
    };
    checkPurchase();
  }, [user, course.name]);

  const handleViewCourse = () => {
    if (!user) {
      toast.error('Please sign in to access courses');
      router.push('/login');
      return;
    }
    if (hasPurchased) {
      router.push(`/course/${course.name}`);
    } else {
      router.push({
        pathname: '/checkout',
        query: {
          courseName: course.name,
          amount: course.price,
        },
      });
    }
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="content p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.name}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description || 'Premium study materials'}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-indigo-600">₹{course.price}</span>
          <button
            onClick={handleViewCourse}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {hasPurchased ? 'View Course' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
