export const SignInCornerBrackets = () => {
  return (
    <>
      {/* Corchete Superior Izquierdo ┌ */}
      <svg className="corner-bracket corner-tl" viewBox="0 0 16 16" fill="none">
        <path
          d="M15 2H6C3.79 2 2 3.79 2 6V15"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      {/* Corchete Superior Derecho ┐ */}
      <svg className="corner-bracket corner-tr" viewBox="0 0 16 16" fill="none">
        <path
          d="M1 2H10C12.21 2 14 3.79 14 6V15"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      {/* Corchete Inferior Izquierdo └ */}
      <svg className="corner-bracket corner-bl" viewBox="0 0 16 16" fill="none">
        <path
          d="M15 14H6C3.79 14 2 12.21 2 10V1"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      {/* Corchete Inferior Derecho ┘ */}
      <svg className="corner-bracket corner-br" viewBox="0 0 16 16" fill="none">
        <path
          d="M1 14H10C12.21 14 14 12.21 14 10V1"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
};
