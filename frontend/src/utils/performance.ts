import * as analytics from './analytics';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// Track Core Web Vitals
export const initPerformanceTracking = () => {
  // First Contentful Paint
  const fcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const firstPaint = entries[0];
    analytics.event({
      action: 'web_vital',
      category: 'Performance',
      label: 'FCP',
      value: Math.round(firstPaint.startTime),
    });
  });
  fcpObserver.observe({ entryTypes: ['paint'] });

  // Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    analytics.event({
      action: 'web_vital',
      category: 'Performance',
      label: 'LCP',
      value: Math.round(lastEntry.startTime),
    });
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      analytics.event({
        action: 'web_vital',
        category: 'Performance',
        label: 'FID',
        value: Math.round(entry.processingStart - entry.startTime),
      });
    });
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift
  const clsObserver = new PerformanceObserver((list) => {
    let clsValue = 0;
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    analytics.event({
      action: 'web_vital',
      category: 'Performance',
      label: 'CLS',
      value: Math.round(clsValue * 1000),
    });
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });

  // Time to First Byte
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationEntry) {
    const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    analytics.event({
      action: 'web_vital',
      category: 'Performance',
      label: 'TTFB',
      value: Math.round(ttfb),
    });
  }
};

// Track resource loading performance
export const trackResourcePerformance = () => {
  const resourceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.initiatorType === 'img' || entry.initiatorType === 'script' || entry.initiatorType === 'css') {
        analytics.event({
          action: 'resource_timing',
          category: 'Performance',
          label: `${entry.initiatorType}: ${entry.name}`,
          value: Math.round(entry.duration),
        });
      }
    });
  });
  resourceObserver.observe({ entryTypes: ['resource'] });
};

// Track long tasks
export const trackLongTasks = () => {
  const longTaskObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      analytics.event({
        action: 'long_task',
        category: 'Performance',
        label: entry.name,
        value: Math.round(entry.duration),
      });
    });
  });
  longTaskObserver.observe({ entryTypes: ['longtask'] });
};

// Initialize all performance tracking
export const initAllPerformanceTracking = () => {
  initPerformanceTracking();
  trackResourcePerformance();
  trackLongTasks();
};
