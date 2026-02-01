import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * MobileRedirect - Automatically redirects mobile users to /mobile
 * 
 * Detects mobile devices and redirects to mobile app unless:
 * - Already on /mobile, /m, or /mobile-dashboard
 * - User explicitly navigated to desktop view
 */
export function MobileRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if already on mobile routes
    const isMobileRoute = 
      location.pathname.startsWith('/mobile') || 
      location.pathname === '/m';

    if (isMobileRoute) {
      return; // Already on mobile, don't redirect
    }

    // Check if user explicitly wants desktop (via query param)
    const params = new URLSearchParams(location.search);
    const forceDesktop = params.get('desktop') === 'true';
    
    if (forceDesktop) {
      // Store preference in sessionStorage
      sessionStorage.setItem('prefer_desktop', 'true');
      return;
    }

    // Check if user previously chose desktop
    const preferDesktop = sessionStorage.getItem('prefer_desktop') === 'true';
    if (preferDesktop) {
      return;
    }

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Also check for small screen size
    const isSmallScreen = window.innerWidth <= 768;

    // Redirect to mobile if on mobile device or small screen
    if (isMobile || isSmallScreen) {
      console.log('[MobileRedirect] Mobile device detected, redirecting to /mobile');
      navigate('/mobile', { replace: true });
    }
  }, [navigate, location]);

  return null; // This component doesn't render anything
}

/**
 * Hook to check if device is mobile
 */
export function useIsMobile() {
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return isMobileDevice || isSmallScreen;
}

/**
 * Hook to force desktop view on mobile
 */
export function useForceDesktop() {
  const navigate = useNavigate();
  const location = useLocation();

  const enableDesktop = () => {
    sessionStorage.setItem('prefer_desktop', 'true');
    const currentPath = location.pathname;
    
    // If on mobile route, go to dashboard
    if (currentPath.startsWith('/mobile') || currentPath === '/m') {
      navigate('/', { replace: true });
    }
  };

  const disableDesktop = () => {
    sessionStorage.removeItem('prefer_desktop');
    navigate('/mobile', { replace: true });
  };

  const isDesktopForced = sessionStorage.getItem('prefer_desktop') === 'true';

  return {
    enableDesktop,
    disableDesktop,
    isDesktopForced
  };
}