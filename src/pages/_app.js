import "@/styles/globals.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Handle route change start
    const handleStart = () => {
      setLoading(true);
    };
    
    // Handle route change complete
    const handleComplete = () => {
      setLoading(false);
    };
    
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);
  
  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 z-50 w-full h-1 bg-red-600">
          <div className="h-full bg-red-400 animate-pulse" style={{ width: '100%' }}></div>
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}

// This ensures the pages are rendered correctly on both client and server
export const config = {
  unstable_runtimeJS: true
};
