import '../styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>EduCourse - Premium Learning Materials</title>
        <meta name="description" content="Access premium study materials for competitive exams" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Load Cashfree SDK */}
      <Script 
        src="https://sdk.cashfree.com/js/v3/cashfree.js" 
        strategy="beforeInteractive" 
      />
      
      <Component {...pageProps} />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default MyApp;
