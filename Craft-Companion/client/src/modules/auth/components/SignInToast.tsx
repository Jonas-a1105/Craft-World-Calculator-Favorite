interface SignInToastProps {
  message: string | null;
}

export const SignInToast = ({ message }: SignInToastProps) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#18181c] text-zinc-100 text-xs font-medium px-4 py-2.5 radius-moderado flex items-center gap-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 border-none select-none pointer-events-none">
      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
      <span>{message}</span>
    </div>
  );
};
