export const formatDate = (dateString: string): { formatted: string; iso: string } => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    // Format relative time
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return {
        formatted: 'Just now',
        iso: date.toISOString()
      };
    } else if (diffInMinutes < 60) {
      return {
        formatted: `${diffInMinutes}m ago`,
        iso: date.toISOString()
      };
    } else if (diffInHours < 24) {
      return {
        formatted: `${diffInHours}h ago`,
        iso: date.toISOString()
      };
    } else if (diffInDays < 7) {
      return {
        formatted: `${diffInDays}d ago`,
        iso: date.toISOString()
      };
    } else {
      return {
        formatted: date.toLocaleDateString(),
        iso: date.toISOString()
      };
    }
  } catch (error) {
    // Return a fallback for invalid dates
    return {
      formatted: 'Unknown date',
      iso: new Date().toISOString() // Current time as fallback
    };
  }
};
