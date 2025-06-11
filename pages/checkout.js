// pages/checkout.js
import Checkout from '../components/Checkout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CheckoutPage() {
  return (
    <>
      <Checkout />
      <ToastContainer />
    </>
  );
}
