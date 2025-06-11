// components/ProductCard.js
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Rating from './Rating';

export default function ProductCard({ product }) {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => console.log('Cashfree SDK loaded');
    document.body.appendChild(script);
  }, []);

  const handleBuyNow = () => {
    router.push({
      pathname: '/checkout',
      query: {
        productId: product.id,
        productName: product.name,
        amount: product.price,
        telegramLink: product.telegramLink,
      },
    });
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <Link href={`/products/${product.id}`}>
        <div className="image-container relative w-full h-64">
          <Image
            src={product.image || '/default-book.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="content p-6 flex flex-col">
        <Link href={`/products/${product.id}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <Rating rating={product.rating} />
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
          <button
            onClick={handleBuyNow}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
