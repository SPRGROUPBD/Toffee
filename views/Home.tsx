
import React, { useState } from 'react';
import { ClockIcon, SolidPlayIcon } from '../components/Icons';
import { useAppContext } from '../AppContext';
import { StreamConfig } from '../types';

export const HomeView: React.FC = () => {
  const { playMedia } = useAppContext();
  const [config, setConfig] = useState<StreamConfig>({
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    cookie: '',
    referer: '',
    origin: '',
    drmLicenseUrl: '',
    userAgent: 'Default',
    drmScheme: 'widevine'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handlePlay = () => {
    if (config.url) {
      playMedia({ ...config, title: 'Network Stream' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h1 className="text-xl font-medium text-slate-800">Network Stream (Video) Pla...</h1>
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <ClockIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <input
            type="text"
            name="url"
            placeholder="Media Stream URL"
            value={config.url}
            onChange={handleChange}
            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>
        <div>
          <input
            type="text"
            name="cookie"
            placeholder="Cookie Value"
            value={config.cookie}
            onChange={handleChange}
            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>
        <div>
          <input
            type="text"
            name="referer"
            placeholder="Referer Value"
            value={config.referer}
            onChange={handleChange}
            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>
        <div>
          <input
            type="text"
            name="origin"
            placeholder="Origin Value"
            value={config.origin}
            onChange={handleChange}
            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>
        <div>
          <input
            type="text"
            name="drmLicenseUrl"
            placeholder="DRM License URL"
            value={config.drmLicenseUrl}
            onChange={handleChange}
            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative border border-slate-300 rounded-md pt-2 px-3 pb-1">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">UserAgent</label>
            <select
              name="userAgent"
              value={config.userAgent}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-slate-700"
            >
              <option value="Default">Default</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="flex-1 relative border border-slate-300 rounded-md pt-2 px-3 pb-1">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">DrmScheme</label>
            <select
              name="drmScheme"
              value={config.drmScheme}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-slate-700"
            >
              <option value="widevine">widevine</option>
              <option value="playready">playready</option>
              <option value="clearkey">clearkey</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-20 right-6">
        <button
          onClick={handlePlay}
          className="bg-indigo-100 text-indigo-700 p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-indigo-200 transition-all flex items-center justify-center"
        >
          <SolidPlayIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
