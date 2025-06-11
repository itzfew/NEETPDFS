// pages/products/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Rating from '../../components/Rating';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch('/products.json')
        .then((res) => res.json())
        .then((data) => {
          const foundProduct = data.find((p) => p.id === parseInt(id));
          setProduct(foundProduct);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error loading product:', error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="product-detail flex-grow">
        <div className="container mx-auto px-4">
          <div className="product-container grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="image-container">
              <Image
                src={product.image || '/default-book.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <div className="content">
              <h1>{product.name}</h1>
              <Rating rating={product.rating} />
              <p>{product.description}</p>
              <div className="meta">
                <p><strong>Author:</strong> {product.author}</p>
                <p><strong>Category:</strong> {product.category}</p>
              </div>
              <div className="features">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center space-x-6">
                <span className="price">₹{product.price}</span>
                <button
                  onClick={handleBuyNow}
                  className="buy-button"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
