
import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { XMarkIcon } from './Icons';
import Hls from 'https://esm.sh/hls.js@1.3.5';
import dashjs from 'https://esm.sh/dashjs@4.7.4';

export const PlayerOverlay: React.FC = () => {
  const { currentMedia, closePlayer, corsProxyEnabled, corsProxyUrl } = useAppContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoProxyActive, setAutoProxyActive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentMedia) return;

    let hls: any = null;
    let dash: any = null;
    let isDestroyed = false;

    const initPlayer = (useProxy: boolean) => {
      if (isDestroyed) return;
      
      // Cleanup previous instances before re-initializing
      if (hls) { hls.destroy(); hls = null; }
      if (dash) { dash.reset(); dash = null; }
      
      setErrorMsg(null);
      const originalUrl = currentMedia.url;

      const getProxiedUrl = (urlToProxy: string) => {
        if (!useProxy || !urlToProxy || !urlToProxy.startsWith('http')) return urlToProxy;
        const proxyBase = corsProxyUrl.split('?')[0];
        if (proxyBase && urlToProxy.includes(proxyBase)) return urlToProxy;
        return corsProxyUrl.replace('{url}', encodeURIComponent(urlToProxy));
      };

      const applyHeaders = (xhr: XMLHttpRequest) => {
        const prefix = useProxy ? 'X-Forwarded-' : '';
        if (currentMedia.cookie) {
          xhr.withCredentials = true; 
          try { xhr.setRequestHeader(`${prefix}Cookie`, currentMedia.cookie); } catch (e) {} 
        }
        if (currentMedia.userAgent && currentMedia.userAgent !== 'Default') {
          try { xhr.setRequestHeader(`${prefix}User-Agent`, currentMedia.userAgent); } catch (e) {}
        }
        if (currentMedia.referer) {
          try { xhr.setRequestHeader(`${prefix}Referer`, currentMedia.referer); } catch (e) {}
        }
        if (currentMedia.origin) {
          try { xhr.setRequestHeader(`${prefix}Origin`, currentMedia.origin); } catch (e) {}
        }
      };

      const playVideo = () => {
        video.play().catch(e => {
          console.warn("Auto-play prevented by browser.", e);
        });
      };

      const isDash = originalUrl.includes('.mpd') || originalUrl.includes('mpd=');
      const isHls = originalUrl.includes('.m3u8') || originalUrl.includes('m3u8=') || (!isDash && !originalUrl.includes('.mp4') && !originalUrl.includes('.mkv'));

      if (isDash) {
        dash = dashjs.MediaPlayer().create();
        
        dash.extend("RequestModifier", () => {
          return {
            modifyRequestURL: function (url: string) { return getProxiedUrl(url); },
            modifyRequestHeader: function (xhr: XMLHttpRequest) { applyHeaders(xhr); return xhr; }
          };
        }, true);

        if (currentMedia.drmScheme && currentMedia.drmLicenseUrl) {
          const schemeMap: Record<string, string> = { 'widevine': 'com.widevine.alpha', 'playready': 'com.microsoft.playready', 'clearkey': 'org.w3.clearkey' };
          const drmKey = schemeMap[currentMedia.drmScheme.toLowerCase()] || 'com.widevine.alpha';
          dash.setProtectionData({ [drmKey]: { serverURL: currentMedia.drmLicenseUrl } });
        }

        dash.initialize(video, originalUrl, true);
        dash.on(dashjs.MediaPlayer.events.ERROR, (e: any) => {
          if (e.error === 'download') {
            if (!useProxy && !corsProxyEnabled) {
              console.log("DASH download failed, retrying with Auto-Proxy...");
              setAutoProxyActive(true);
              initPlayer(true);
            } else {
              setErrorMsg("DASH stream download failed. The network might be rejecting the proxy or the link is expired.");
            }
          }
        });

      } else if (isHls && Hls.isSupported()) {
        
        class ProxyLoader {
          loader: any;
          constructor(config: any) {
            this.loader = new Hls.DefaultConfig.loader(config);
          }
          load(context: any, config: any, callbacks: any) {
            if (context.url) context.url = getProxiedUrl(context.url);
            this.loader.load(context, config, callbacks);
          }
          abort() { this.loader.abort(); }
          destroy() { this.loader.destroy(); }
        }

        hls = new Hls({
          pLoader: ProxyLoader,
          fLoader: ProxyLoader,
          xhrSetup: (xhr, url) => { applyHeaders(xhr); }
        });
        
        hls.loadSource(originalUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Auto-CORS Fallback
                if (!useProxy && !corsProxyEnabled) {
                  console.log("HLS network error, retrying with Auto-Proxy...");
                  setAutoProxyActive(true);
                  initPlayer(true);
                } else {
                  setErrorMsg("Network error encountered. The stream might be blocking web playback (CORS) or the proxy failed.");
                  hls?.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                setErrorMsg("Fatal error loading stream.");
                break;
            }
          }
        });
      } else {
        video.src = getProxiedUrl(originalUrl);
        if (originalUrl.includes('.m3u8')) video.addEventListener('loadedmetadata', playVideo);
        else playVideo();
      }
    };

    // Initialize with user's settings
    initPlayer(corsProxyEnabled);

    return () => {
      isDestroyed = true;
      if (hls) hls.destroy();
      if (dash) dash.reset();
      video.removeAttribute('src');
      video.load();
    };
  }, [currentMedia, corsProxyEnabled, corsProxyUrl]);

  if (!currentMedia) return null;

  const isProxying = corsProxyEnabled || autoProxyActive;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10 transition-opacity">
        <button onClick={closePlayer} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
          <XMarkIcon className="w-8 h-8" />
        </button>
        <div className="text-white font-medium truncate px-4 flex-1 text-center text-sm md:text-base">
          {currentMedia.title || currentMedia.url}
        </div>
        <div className="w-12"></div>
      </div>

      {currentMedia.cookie && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-indigo-600/80 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Cookie Headers Active {isProxying ? '(Proxied)' : ''}
        </div>
      )}

      {isProxying && (
        <div className="absolute bottom-24 right-4 z-10 bg-orange-500/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-80 pointer-events-none transition-all">
          CORS Bypass {autoProxyActive ? 'Auto-Triggered' : 'Active'}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center bg-black relative group">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          playsInline
        />
        
        {errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 z-20">
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-6 rounded-2xl text-center backdrop-blur-xl max-w-sm shadow-2xl">
              <p className="font-semibold mb-3 text-lg">Playback Error</p>
              <p className="text-sm leading-relaxed">{errorMsg}</p>
              <div className="mt-5 pt-4 border-t border-red-500/20 text-xs text-slate-300 space-y-2 text-left bg-black/20 p-3 rounded-lg">
                <p>• The stream link might be expired or geo-blocked.</p>
                <p>• The CORS proxy may be rejecting the connection.</p>
                <p>• Check if the stream requires valid Cookie/Referer values.</p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-6 w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-xl transition-colors text-sm font-medium border border-red-500/30"
              >
                Reload App
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
