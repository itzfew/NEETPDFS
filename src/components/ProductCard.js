import { useState } from 'react';
import Link from 'next/link';
import { auth, database } from '../firebase/firebaseConfig';
import { ref, get, set } from 'firebase/database';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { Cashfree } from '@cashfree/js-sdk';

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

  const handlePayNow = async () => {
    if (!auth.currentUser) {
      toast
