import { Link } from 'react-router-dom';

import { useModelStatus } from '../contexts/ModelStatusContext';

interface ServiceStatusBannerProps {
  className?: string;
}

/**
 * Banner that shows when face service is unavailable or model is not loaded.
 * Displayed on Login and Signup pages to guide users.
 */
export function ServiceStatusBanner({ className = '' }: ServiceStatusBannerProps) {
  const { faceServiceOk, modelsLoaded, model, isChecking, isLoadingModel } = useModelStatus();

  const isModelReady = modelsLoaded && model !== null;

  // Don't show anything while checking
  if (isChecking) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-blue-700">
          <span className="animate-spin">⟳</span>
          <span>Checking service status...</span>
        </div>
      </div>
    );
  }

  // Face service is not available
  if (!faceServiceOk) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <span>⚠️</span>
            <span>Face Service Unavailable</span>
          </div>
          <p className="text-amber-700 text-sm">
            The face recognition service is currently unavailable. It may be sleeping to save
            resources. Please wait a moment and try refreshing the status panel above.
          </p>
        </div>
      </div>
    );
  }

  // Face service is OK but model is not loaded
  if (!isModelReady) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <span>⚠️</span>
            <span>{isLoadingModel ? 'Loading Model...' : 'Model Not Loaded'}</span>
          </div>
          <p className="text-amber-700 text-sm">
            {isLoadingModel ? (
              'The face recognition model is currently loading. This may take a moment...'
            ) : (
              <>
                A face recognition model must be loaded before you can log in or sign up. Please
                click the <strong>&ldquo;Load Model&rdquo;</strong> button in the status panel
                above, or visit the{' '}
                <Link to="/config" className="underline hover:text-amber-900">
                  Config
                </Link>{' '}
                page for more details.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Everything is ready - don't show banner
  return null;
}
