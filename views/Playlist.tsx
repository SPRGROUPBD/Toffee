
import React, { useState } from 'react';
import { DotsVerticalIcon, PencilIcon, CloudArrowDownIcon, MagnifyingGlassIcon, TrashIcon } from '../components/Icons';
import { useAppContext } from '../AppContext';
import { PlaylistItem } from '../types';

export const PlaylistView: React.FC = () => {
  const { playlists, addPlaylist, playMedia, updatePlaylist, deletePlaylist, m3uPlaylists, isLoadingM3u, loadM3uPlaylist } = useAppContext();
  
  const [tab, setTab] = useState<'custom' | 'm3u'>('custom');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '', userAgent: 'Default', cookie: '', referer: '' });
  
  const [isM3uModalOpen, setIsM3uModalOpen] = useState(false);
  const [m3uUrl, setM3uUrl] = useState('https://raw.githubusercontent.com/Mrbotrx/All-FREE-TV/refs/heads/main/combined_playlist.m3u');
  const [searchQuery, setSearchQuery] = useState('');

  const openCustomModal = (item?: PlaylistItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        name: item.name, 
        url: item.url, 
        userAgent: item.userAgent || 'Default',
        cookie: item.cookie || '',
        referer: item.referer || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', url: '', userAgent: 'Default', cookie: '', referer: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveCustom = () => {
    if (!formData.name || !formData.url) return;
    if (editingId) {
      updatePlaylist(editingId, formData);
    } else {
      addPlaylist({
        id: Date.now().toString(),
        ...formData
      });
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleLoadM3u = async () => {
    if (!m3uUrl) return;
    await loadM3uPlaylist(m3uUrl);
    setIsM3uModalOpen(false);
    setTab('m3u');
  };

  const filteredM3u = m3uPlaylists.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.group?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayedM3u = filteredM3u.slice(0, 150);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex items-center justify-between p-4 bg-white">
        <h1 className="text-xl font-medium text-slate-800">Playlist</h1>
        <div className="flex gap-2">
          {tab === 'm3u' && (
             <button onClick={() => setIsM3uModalOpen(true)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors" title="Import M3U or JSON URL">
               <CloudArrowDownIcon className="w-5 h-5" />
             </button>
          )}
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <DotsVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white">
        <button onClick={() => setTab('custom')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'custom' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>My List</button>
        <button onClick={() => setTab('m3u')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'm3u' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Web Streams</button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'custom' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            {playlists.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between group hover:shadow-md transition-shadow">
                <div 
                  className="flex-1 cursor-pointer overflow-hidden"
                  onClick={() => playMedia({ url: item.url, title: item.name, userAgent: item.userAgent, cookie: item.cookie, referer: item.referer })}
                >
                  <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-500 truncate mt-1">{item.url}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openCustomModal(item); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"
                    title="Edit Playlist"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deletePlaylist(item.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                    title="Delete Playlist"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {playlists.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">Your manual list is empty.</div>
            )}
            
            <div className="absolute bottom-6 right-6 z-10">
              <button
                onClick={() => openCustomModal()}
                className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center text-2xl font-light w-14 h-14"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-white shadow-sm z-10">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search channels or groups..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-20">
              {isLoadingM3u ? (
                <div className="py-10 text-center text-sm font-medium text-slate-500 animate-pulse">Fetching & Parsing Playlist...</div>
              ) : m3uPlaylists.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-500">
                  <CloudArrowDownIcon className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm">No external streams loaded.</p>
                  <button onClick={() => setIsM3uModalOpen(true)} className="mt-4 px-5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors">Import URL</button>
                </div>
              ) : (
                <>
                  {displayedM3u.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => playMedia({ url: item.url, title: item.name, userAgent: item.userAgent, cookie: item.cookie, referer: item.referer })} 
                      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                      {item.logo ? (
                        <div className="w-12 h-12 flex-shrink-0 bg-slate-900 rounded overflow-hidden flex items-center justify-center p-1">
                          <img src={item.logo} alt="" className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex-shrink-0 bg-slate-200 rounded flex items-center justify-center font-bold text-slate-400 text-xs">TV</div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                        {item.group && <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded uppercase tracking-wider">{item.group}</span>}
                      </div>
                    </div>
                  ))}
                  {filteredM3u.length > 150 && (
                    <div className="text-xs text-center text-slate-400 py-4 font-medium">
                      Showing 150 of {filteredM3u.length} streams. Use search to find more.
                    </div>
                  )}
                  {displayedM3u.length === 0 && (
                    <div className="text-sm text-center text-slate-400 py-10">No channels found for "{searchQuery}".</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Playlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f0f2fb] rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">{editingId ? 'Edit Stream' : 'Add Stream'}</h2>
            <div className="space-y-4">
              <div className="relative border border-slate-300 rounded-md pt-2 px-3 pb-1 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">Stream Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"
                  placeholder="My Stream"
                />
              </div>
              <div className="relative border border-slate-300 rounded-md pt-2 px-3 pb-1 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">Stream URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"
                  placeholder="http://..."
                />
              </div>
              <div className="relative border border-slate-300 rounded-md pt-2 px-3 pb-1 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">Cookie (Optional)</label>
                <input
                  type="text"
                  value={formData.cookie}
                  onChange={e => setFormData({...formData, cookie: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"
                  placeholder="auth_token=123; session=abc"
                />
              </div>
              <div className="relative border border-slate-300 rounded-md pt-2 px-3 pb-1 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">Referer (Optional)</label>
                <input
                  type="text"
                  value={formData.referer}
                  onChange={e => setFormData({...formData, referer: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"
                  placeholder="https://example.com"
                />
              </div>
              <div className="relative border border-slate-300 rounded-md pt-2 px-3 pb-1 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">User Agent (Optional)</label>
                <input
                  type="text"
                  value={formData.userAgent}
                  onChange={e => setFormData({...formData, userAgent: e.target.value})}
                  className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"
                  placeholder="Mozilla/5.0 (Windows NT 10.0...)"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-full hover:bg-slate-300 transition-colors">Cancel</button>
              <button onClick={handleSaveCustom} className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-colors">{editingId ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Loader Modal */}
      {isM3uModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f0f2fb] rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">Load Playlist</h2>
            <div className="space-y-4">
              <div className="relative border border-slate-300 rounded-md pt-2 px-3 pb-1 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-slate-500">M3U or JSON URL</label>
                <input
                  type="text"
                  value={m3uUrl}
                  onChange={e => setM3uUrl(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"
                  placeholder="https://..."
                />
              </div>
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Enter a raw URL to an M3U file or a JSON array. The playlist will be parsed automatically.
              </p>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsM3uModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-full hover:bg-slate-300 transition-colors">Cancel</button>
              <button onClick={handleLoadM3u} disabled={isLoadingM3u} className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {isLoadingM3u ? 'Loading...' : 'Load'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
