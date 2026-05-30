import { useState, useEffect } from 'react';

export const useUrlDatabase = () => {
  const [urls, setUrls] = useState<string[]>(() => {
    const saved = localStorage.getItem('qr-urls');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUrl, setCurrentUrl] = useState<string>(() => {
      const saved = localStorage.getItem('qr-urls');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed[0] : '';
  });

  useEffect(() => {
    localStorage.setItem('qr-urls', JSON.stringify(urls));
  }, [urls]);

  const addUrl = (url: string) => {
    setUrls(prev => {
        if (!prev.includes(url)) {
          return [url, ...prev];
        } else {
          const filtered = prev.filter(u => u !== url);
          return [url, ...filtered];
        }
    });
    setCurrentUrl(url);
  };

  const selectUrl = (url: string) => {
    setUrls(prev => {
        if (prev.includes(url)) {
          const filtered = prev.filter(u => u !== url);
          return [url, ...filtered];
        }
        return prev;
    });
    setCurrentUrl(url);
  };

  return { urls, currentUrl, addUrl, selectUrl };
};
