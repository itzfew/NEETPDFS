// pages/_document.js or components/CashfreeScript.js
import Script from 'next/script';

export const CashfreeScript = () => (
  <Script
    src="https://sdk.cashfree.com/js/v3/cashfree.js"
    strategy="beforeInteractive"
  />
);

// Then use it in your _app.js
import { CashfreeScript } from '../components/CashfreeScript';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <CashfreeScript />
      <Component {...pageProps} />
      <ToastContainer />
    </>
  );
}
