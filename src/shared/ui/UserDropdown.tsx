import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/_stores/authStore';

interface UserDropdownProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string;
}

export function UserDropdown({ userName, userEmail, avatarUrl }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const clearSession = useAuthStore((state) => state.clearSession);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {userName}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 mt-1">{userEmail}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
