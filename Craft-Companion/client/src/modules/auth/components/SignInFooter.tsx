interface SignInFooterProps {
  language: string;
}

export const SignInFooter = ({ language }: SignInFooterProps) => {
  return (
    <p className="text-xs text-center text-slate-400">
      {language === 'es'
        ? '¿No tienes cuenta? Se creará automáticamente al conectar.'
        : "Don't have an account? One will be created when you connect."}
    </p>
  );
};
