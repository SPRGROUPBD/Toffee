
import React from 'react';
import { GridIcon, SolidFolderIcon } from '../components/Icons';

interface FolderData {
  name: string;
  count: number;
}

const mockFolders: FolderData[] = [
  { name: 'ADM', count: 1 },
  { name: 'CapCut', count: 7 },
  { name: 'InstaPro', count: 14 },
  { name: 'Instagram', count: 1 },
  { name: 'Movies', count: 8 },
  { name: 'Movies', count: 1 },
  { name: 'Telegram Images', count: 2 },
  { name: 'Telegram Video', count: 4 },
  { name: 'WhatsApp', count: 1 },
  { name: 'WhatsApp Video', count: 12 },
  { name: 'aaaa', count: 1 },
];

export const LocalView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h1 className="text-xl font-medium text-slate-800">Local</h1>
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <GridIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-6">
          {mockFolders.map((folder, index) => (
            <div key={index} className="flex flex-col items-center cursor-pointer group">
              <SolidFolderIcon className="w-20 h-20 text-slate-400 group-hover:text-slate-500 transition-colors" />
              <span className="text-sm font-medium text-slate-700 mt-2 text-center break-words w-full leading-tight">{folder.name}</span>
              <span className="text-xs text-slate-500">{folder.count} Video{folder.count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
