declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 tracking ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Custom events for our application
export const trackProjectCreation = (projectType: string) => {
  event({
    action: 'create_project',
    category: 'Project',
    label: projectType,
  });
};

export const trackProjectCompletion = (projectId: string) => {
  event({
    action: 'complete_project',
    category: 'Project',
    label: projectId,
  });
};

export const trackDesignStep = (step: number, totalSteps: number) => {
  event({
    action: 'design_step',
    category: 'Design',
    label: `Step ${step} of ${totalSteps}`,
    value: step,
  });
};

export const trackImageDownload = (projectId: string) => {
  event({
    action: 'download_image',
    category: 'Project',
    label: projectId,
  });
};

export const trackFavoriteToggle = (projectId: string, isFavorite: boolean) => {
  event({
    action: isFavorite ? 'add_favorite' : 'remove_favorite',
    category: 'Project',
    label: projectId,
  });
};

export const trackSearch = (searchTerm: string) => {
  event({
    action: 'search',
    category: 'Navigation',
    label: searchTerm,
  });
};

export const trackFilterChange = (filterType: string, value: string) => {
  event({
    action: 'filter_change',
    category: 'Navigation',
    label: `${filterType}: ${value}`,
  });
};
