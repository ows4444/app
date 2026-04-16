"use client";

export function AuthErrorFallback({
  reset,
  error,
}: {
  reset: () => void;
  error: { message: string; status?: number } | null;
}) {
  const isSessionExpired = error?.message === "SESSION_EXPIRED";

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-red-500">{isSessionExpired ? "Session expired" : "Authentication failed"}</p>

      <div className="flex gap-2">
        {!isSessionExpired && (
          <button onClick={reset} className="underline">
            Retry
          </button>
        )}

        <button onClick={() => (window.location.href = "/login")} className="underline">
          Go to login
        </button>
      </div>
    </div>
  );
}
