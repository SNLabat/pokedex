import "@/styles/globals.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(0); // Add a key to force remounting
  
  useEffect(() => {
    // Handle route change start
    const handleStart = (url) => {
      console.log(`Loading: ${url}`);
      setLoading(true);
    };
    
    // Handle route change complete
    const handleComplete = (url) => {
      console.log(`Complete: ${url}`);
      setLoading(false);
      // Force component remount on navigation
      setKey(prevKey => prevKey + 1);
    };
    
    // Handle route change error
    const handleError = (err, url) => {
      console.log(`Error: ${url}`, err);
      setLoading(false);
    };
    
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);
    
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);
  
  // Force full remount of components when route changes
  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 z-50 w-full h-1 bg-red-600">
          <div className="h-full bg-red-400 animate-pulse" style={{ width: '100%' }}></div>
        </div>
      )}
      <Component {...pageProps} key={router.asPath} />
    </>
  );
}

// This ensures the pages are rendered correctly on both client and server
export const config = {
  unstable_runtimeJS: true
};
