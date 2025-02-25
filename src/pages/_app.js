import "@/styles/globals.css";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // Handle route change complete
    const handleRouteChangeComplete = () => {
      // Scroll to top on page changes
      window.scrollTo(0, 0);
    };
    
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);
  
  return <Component {...pageProps} />;
}

// Add this to disable automatic static optimization for dynamic routes
export const config = {
  unstable_runtimeJS: true
};
