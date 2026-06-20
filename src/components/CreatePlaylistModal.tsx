import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePlaylists } from '../hooks/usePlaylists';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const { createNewPlaylist } = usePlaylists();

  // Reset name when opened
  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createNewPlaylist(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#282828] w-full max-w-md rounded-xl shadow-2xl p-6 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create a playlist</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoFocus
              placeholder="My Playlist #1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-transparent focus:border-white/20 rounded-md px-4 py-3 text-white placeholder:text-text-secondary outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full font-bold text-white hover:scale-105 transition-transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
