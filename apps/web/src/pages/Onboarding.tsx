import { useAuth } from '../contexts/AuthContext';

export function Onboarding() {
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Hello {user?.name || user?.email || 'User'}!
        </h1>
        <p className="mt-4 text-gray-600">
          Welcome to Praapt. Your account has been set up successfully.
        </p>
      </div>
    </div>
  );
}
