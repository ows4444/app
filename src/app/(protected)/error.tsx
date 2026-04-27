"use client";

export default function ProtectedError({ error, reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <div className="p-4">
      <p>Something went wrong</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
