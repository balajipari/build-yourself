import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as analytics from '../utils/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track pageview on route change
    analytics.pageview(location.pathname + location.search);
  }, [location]);

  return {
    trackProjectCreation: analytics.trackProjectCreation,
    trackProjectCompletion: analytics.trackProjectCompletion,
    trackDesignStep: analytics.trackDesignStep,
    trackImageDownload: analytics.trackImageDownload,
    trackFavoriteToggle: analytics.trackFavoriteToggle,
    trackSearch: analytics.trackSearch,
    trackFilterChange: analytics.trackFilterChange,
  };
};
