import { useAuth } from '../contexts/AuthContext';

interface UserProps {
  apiBase: string;
}

export function User({ apiBase }: UserProps) {
  const { user, matchInfo } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-gray-600">No user information available.</p>
      </div>
    );
  }

  // Split matches by threshold
  const belowThreshold =
    matchInfo?.topMatches?.filter((m) => m.distance <= (matchInfo?.threshold ?? 0)) ?? [];
  const aboveThreshold =
    matchInfo?.topMatches?.filter((m) => m.distance > (matchInfo?.threshold ?? 0)) ?? [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Welcome, {user.name || user.email}!</h2>
          {matchInfo && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Matched with distance {matchInfo.distance.toFixed(4)} (threshold:{' '}
              {matchInfo.threshold.toFixed(4)})
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {matchInfo?.topMatches?.length ?? 0} candidates compared • {belowThreshold.length} below
            threshold
          </p>
        </div>

        {/* Login image */}
        {matchInfo?.loginImage && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Your Login Image</p>
            <img
              src={matchInfo.loginImage}
              alt="Login capture"
              className="w-24 h-24 rounded-lg object-cover border-2 border-blue-400"
            />
          </div>
        )}
      </div>

      {/* Top Candidates Grid */}
      {matchInfo?.topMatches && matchInfo.topMatches.length > 0 && (
        <div className="space-y-4">
          {/* Below threshold section */}
          {belowThreshold.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600">
                ✓ Below threshold ({matchInfo.threshold.toFixed(3)})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {belowThreshold.map((match) => {
                  const isMatchedUser = match.email === user.email;
                  const imageUrl = match.profileImagePath
                    ? `${apiBase}/images/file/${encodeURIComponent(match.profileImagePath)}`
                    : null;
                  const originalIndex = matchInfo.topMatches.findIndex(
                    (m) => m.email === match.email,
                  );

                  return (
                    <div
                      key={match.email}
                      className={`w-full space-y-2 p-2 border-2 rounded-lg ${
                        isMatchedUser
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-300'
                          : 'border-green-400 bg-green-50'
                      }`}
                    >
                      <div
                        className="w-full border rounded overflow-hidden relative"
                        style={{ aspectRatio: '1/1', maxHeight: '200px' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={match.name || match.email}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}

                        {/* Rank badge */}
                        <div
                          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                            isMatchedUser ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
                          }`}
                        >
                          {originalIndex + 1}
                        </div>

                        {/* Matched checkmark */}
                        {isMatchedUser && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                            ✓
                          </div>
                        )}

                        {/* Bottom info bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="truncate">{match.name || 'Unknown'}</span>
                            <span className="font-mono font-bold text-green-300">
                              {match.distance.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Threshold divider */}
          {belowThreshold.length > 0 && aboveThreshold.length > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 border-t-2 border-dashed border-red-300"></div>
              <span className="text-sm text-red-500 font-medium px-2">
                threshold {matchInfo.threshold.toFixed(3)}
              </span>
              <div className="flex-1 border-t-2 border-dashed border-red-300"></div>
            </div>
          )}

          {/* Above threshold section */}
          {aboveThreshold.length > 0 && (
            <div className="space-y-2">
              {belowThreshold.length === 0 && (
                <p className="text-sm font-medium text-red-500">
                  ✗ All above threshold ({matchInfo.threshold.toFixed(3)})
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {aboveThreshold.map((match) => {
                  const imageUrl = match.profileImagePath
                    ? `${apiBase}/images/file/${encodeURIComponent(match.profileImagePath)}`
                    : null;
                  const originalIndex = matchInfo.topMatches.findIndex(
                    (m) => m.email === match.email,
                  );

                  return (
                    <div
                      key={match.email}
                      className="w-full space-y-2 p-2 border rounded-lg bg-white"
                    >
                      <div
                        className="w-full border rounded overflow-hidden relative"
                        style={{ aspectRatio: '1/1', maxHeight: '200px' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={match.name || match.email}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}

                        {/* Rank badge */}
                        <div className="absolute top-2 left-2 bg-gray-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                          {originalIndex + 1}
                        </div>

                        {/* Bottom info bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="truncate">{match.name || 'Unknown'}</span>
                            <span className="font-mono text-gray-300">
                              {match.distance.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            ✓ = matched user • Lower distance = better match
          </p>
        </div>
      )}
    </div>
  );
}
