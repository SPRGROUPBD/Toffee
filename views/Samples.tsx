
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../components/Icons';
import { useAppContext } from '../AppContext';
import { SampleCategory } from '../types';

const sampleData: SampleCategory[] = [
  { title: 'Clear DASH', items: [{ title: 'Big Buck Bunny (Clear)', url: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd' }] },
  { title: 'Widevine DASH (MP4, H264)', items: [{ title: 'Sintel (Widevine)', url: 'https://storage.googleapis.com/wvmedia/cenc/h264/tears/tears.mpd', drmScheme: 'widevine', drmLicenseUrl: 'https://proxy.uat.widevine.com/proxy?provider=widevine_test' }] },
  { title: 'Widevine DASH (WebM, VP9)', items: [] },
  { title: 'Widevine DASH (MP4, H265)', items: [] },
  { title: 'Widevine DASH (policy tests)', items: [] },
  { title: '60fps DASH', items: [] },
  { title: 'DASH - Multiple base URLs', items: [] },
  { title: 'HLS', items: [{ title: 'Apple Basic Stream', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8' }] },
  { title: 'SmoothStreaming', items: [] },
  { title: 'AV1', items: [] },
  { title: 'Progressive', items: [{ title: 'Big Buck Bunny (MP4)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }] },
  { title: 'Dolby', items: [] },
  { title: 'More Sample', items: [] },
];

export const SamplesView: React.FC = () => {
  const { playMedia } = useAppContext();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleCategory = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100">
        <h1 className="text-xl font-medium text-slate-800">Samples</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sampleData.map((category, index) => (
          <div key={index} className="border border-slate-200 rounded-md overflow-hidden">
            <button
              onClick={() => toggleCategory(index)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 text-left transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">{category.title}</span>
              {openIndex === index ? (
                <ChevronUpIcon className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-slate-500" />
              )}
            </button>
            
            {openIndex === index && category.items.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-200 p-2">
                {category.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => playMedia({ ...item })}
                    className="w-full text-left p-2 hover:bg-slate-200 rounded text-sm text-indigo-600 transition-colors"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
            {openIndex === index && category.items.length === 0 && (
              <div className="bg-slate-50 border-t border-slate-200 p-3 text-sm text-slate-500 italic">
                No samples available in this category.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
