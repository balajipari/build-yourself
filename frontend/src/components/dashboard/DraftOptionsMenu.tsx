import React, { useRef, useEffect } from 'react';
import { TbTrash } from "react-icons/tb";
import toast from 'react-hot-toast';

interface DraftOptionsMenuProps {
  projectId: string;
  onClose: () => void;
  onDelete: (projectId: string) => void;
}

const DraftOptionsMenu = ({ projectId, onClose, onDelete }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex items-center gap-4">
        <span>Delete this draft? This action cannot be undone.</span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
              onDelete(projectId);
            }}
          >
            Delete
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
    onClose();
  };

  return (
    <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-10" ref={menuRef}>
      <button
        onClick={confirmDelete}
        className="w-full px-4 py-1.5 font-semibold text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
      >
        <TbTrash className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

export default DraftOptionsMenu;
