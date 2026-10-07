interface SignInErrorAlertProps {
  message?: string;
}

export const SignInErrorAlert = ({ message }: SignInErrorAlertProps) => {
  if (!message) return null;

  return (
    <div className="text-xs text-center bg-rose-950/40 border-none rounded-xl p-2.5 text-rose-300 leading-relaxed">
      ⚠️ {message}
    </div>
  );
};
