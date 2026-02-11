
import React from 'react';
import { useAppContext } from '../AppContext';

export const SettingsView: React.FC = () => {
  const { corsProxyEnabled, setCorsProxyEnabled, corsProxyUrl, setCorsProxyUrl } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b border-slate-200 bg-white shadow-sm">
        <h1 className="text-xl font-medium text-slate-800">Settings</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        
        {/* Proxy Settings Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">CORS & Playback Bypass</h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Standard web browsers aggressively block cross-origin requests and custom headers (like Cookies and User-Agents). Enable the CORS Proxy to dynamically route stream traffic through a bypass server, enabling locked streams to play directly in your browser.
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <span className="text-sm font-medium text-slate-700">Enable CORS Proxy Engine</span>
            <button
              onClick={() => setCorsProxyEnabled(!corsProxyEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${corsProxyEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${corsProxyEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {corsProxyEnabled && (
            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proxy URL Format</label>
              <input
                type="text"
                value={corsProxyUrl}
                onChange={e => setCorsProxyUrl(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                placeholder="https://corsproxy.io/?{url}"
              />
              <p className="text-xs text-slate-400">
                Use <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{url}'}</code> as the exact placeholder for the media stream target.
              </p>
              
              <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg text-xs mt-2 border border-indigo-100">
                <strong>Header Injection:</strong> When active, Cookies and User-Agents are automatically sent as <code className="bg-white px-1 rounded">X-Forwarded-*</code> headers to evade browser blocks. Ensure your proxy server is configured to translate these into standard headers for full cookie support!
              </div>
            </div>
          )}
        </div>
        
        {/* Placeholder for future settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 opacity-50">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">App Preferences</h2>
          <p className="text-sm text-slate-500">More settings coming soon.</p>
        </div>

      </div>
    </div>
  );
};
