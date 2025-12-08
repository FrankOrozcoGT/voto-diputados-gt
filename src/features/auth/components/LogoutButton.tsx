import { useLogout } from '../api/useLogout';

export function LogoutButton() {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </button>
  );
}
