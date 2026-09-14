export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-coral/40 bg-[#2a1d1b] p-4 text-sm text-coral">
      {message}
    </div>
  );
}
