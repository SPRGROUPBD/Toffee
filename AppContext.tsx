
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { StreamConfig, PlaylistItem } from './types';

interface AppContextType {
  currentMedia: StreamConfig | null;
  playMedia: (config: StreamConfig) => void;
  closePlayer: () => void;
  playlists: PlaylistItem[];
  addPlaylist: (item: PlaylistItem) => void;
  updatePlaylist: (id: string, updated: Partial<PlaylistItem>) => void;
  deletePlaylist: (id: string) => void;
  m3uPlaylists: PlaylistItem[];
  isLoadingM3u: boolean;
  loadM3uPlaylist: (url: string) => Promise<void>;
  corsProxyEnabled: boolean;
  setCorsProxyEnabled: (enabled: boolean) => void;
  corsProxyUrl: string;
  setCorsProxyUrl: (url: string) => void;
}

const defaultPlaylists: PlaylistItem[] = [
  { id: '1', name: 'test1', url: 'http://localhost:8080/test1', userAgent: 'Default' },
  { id: '2', name: 'test2', url: 'http://localhost:8080/test2', userAgent: 'Default' },
  { id: '3', name: 'test3', url: 'http://localhost:8080/test3', userAgent: 'Default' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMedia, setCurrentMedia] = useState<StreamConfig | null>(null);
  
  // Proxy Settings (Enabled by default to solve CORS errors automatically)
  const [corsProxyEnabled, setCorsProxyEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('cors_proxy_enabled');
    return stored ? stored === 'true' : true; 
  });
  
  const [corsProxyUrl, setCorsProxyUrl] = useState<string>(() => {
    return localStorage.getItem('cors_proxy_url') || 'https://corsproxy.io/?{url}';
  });

  // Playlists
  const [playlists, setPlaylists] = useState<PlaylistItem[]>(() => {
    try {
      const saved = localStorage.getItem('custom_playlists');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load playlists from local storage', e);
    }
    return defaultPlaylists;
  });

  const [m3uPlaylists, setM3uPlaylists] = useState<PlaylistItem[]>([]);
  const [isLoadingM3u, setIsLoadingM3u] = useState(false);

  useEffect(() => {
    localStorage.setItem('custom_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('cors_proxy_enabled', String(corsProxyEnabled));
    localStorage.setItem('cors_proxy_url', corsProxyUrl);
  }, [corsProxyEnabled, corsProxyUrl]);

  const playMedia = (config: StreamConfig) => {
    setCurrentMedia(config);
  };

  const closePlayer = () => {
    setCurrentMedia(null);
  };

  const addPlaylist = (item: PlaylistItem) => {
    setPlaylists([...playlists, item]);
  };

  const updatePlaylist = (id: string, updated: Partial<PlaylistItem>) => {
    setPlaylists(playlists.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const parseM3u = (text: string, sourceUrl: string): PlaylistItem[] => {
    const lines = text.split(/\r?\n/);
    const items: PlaylistItem[] = [];
    let currentItem: Partial<PlaylistItem> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        if (line.startsWith('#EXTINF:')) {
          let name = 'Unknown Stream';
          const lastCommaIdx = line.lastIndexOf(',');
          if (lastCommaIdx !== -1 && lastCommaIdx > line.indexOf('#EXTINF:')) {
            name = line.substring(lastCommaIdx + 1).trim() || name;
          }

          const logoMatch = line.match(/tvg-logo=(["'])(.*?)\1/i);
          const groupMatch = line.match(/group-title=(["'])(.*?)\1/i);
          const userAgentMatch = line.match(/user-agent=(["'])(.*?)\1/i);

          currentItem = {
            ...currentItem,
            name,
            logo: logoMatch ? logoMatch[2] : undefined,
            group: groupMatch ? groupMatch[2] : 'Uncategorized',
            userAgent: userAgentMatch ? userAgentMatch[2] : currentItem.userAgent || 'Default',
          };
        } else if (line.startsWith('#EXTVLCOPT:')) {
          const optStr = line.substring(11).trim();
          if (optStr.toLowerCase().startsWith('http-user-agent=')) {
            currentItem.userAgent = optStr.substring(16);
          } else if (optStr.toLowerCase().startsWith('http-referrer=')) {
            currentItem.referer = optStr.substring(14);
          }
        } else if (!line.startsWith('#')) {
          let streamUrl = line;
          
          if (streamUrl.includes('|')) {
            const parts = streamUrl.split('|');
            streamUrl = parts[0];
            const optionsStr = parts[1];
            
            const optionPairs = optionsStr.split('&');
            optionPairs.forEach(pair => {
              const [k, v] = pair.split('=');
              if (k && v) {
                const key = k.toLowerCase();
                if (key === 'user-agent') currentItem.userAgent = decodeURIComponent(v);
                if (key === 'cookie') currentItem.cookie = decodeURIComponent(v);
                if (key === 'referer') currentItem.referer = decodeURIComponent(v);
              }
            });
          }

          if (!streamUrl.startsWith('http')) {
            try {
              streamUrl = new URL(streamUrl, sourceUrl).href;
            } catch (e) { }
          }

          if (streamUrl) {
            items.push({
              id: `m3u-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: currentItem.name || 'Unknown Stream',
              logo: currentItem.logo,
              group: currentItem.group || 'Uncategorized',
              userAgent: currentItem.userAgent || 'Default',
              cookie: currentItem.cookie,
              referer: currentItem.referer,
              url: streamUrl
            });
          }
          currentItem = {};
        }
      } catch (err) {
        console.warn('Skipped malformed M3U line:', line, err);
      }
    }
    return items;
  };

  const loadM3uPlaylist = async (url: string) => {
    setIsLoadingM3u(true);
    try {
      const fetchUrl = corsProxyEnabled ? corsProxyUrl.replace('{url}', encodeURIComponent(url)) : url;
      
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();

      let parsedItems: PlaylistItem[] = [];

      try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
          parsedItems = jsonData.map((item, index) => ({
            id: `json-${Date.now()}-${index}`,
            name: item.name || item.title || 'Unknown Stream',
            url: item.link || item.url || '',
            logo: item.logo || item.icon,
            group: item.category || item.group || 'Uncategorized',
            userAgent: item.user_agent || item.userAgent || item['user-agent'] || 'Default',
            cookie: item.cookie || item.cookies,
            referer: item.referer || item.referrer
          })).filter(item => item.url);
        } else {
          throw new Error("JSON is not an array");
        }
      } catch (e) {
        parsedItems = parseM3u(text, url);
      }

      setM3uPlaylists(parsedItems);
    } catch (err) {
      console.error("Failed to load playlist:", err);
      alert("Failed to fetch playlist. Check the URL or ensure your CORS Proxy is working.");
    } finally {
      setIsLoadingM3u(false);
    }
  };

  return (
    <AppContext.Provider value={{
      currentMedia,
      playMedia,
      closePlayer,
      playlists,
      addPlaylist,
      updatePlaylist,
      deletePlaylist,
      m3uPlaylists,
      isLoadingM3u,
      loadM3uPlaylist,
      corsProxyEnabled,
      setCorsProxyEnabled,
      corsProxyUrl,
      setCorsProxyUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
