import Button from '../../../components/ui/Button';
import { BoltBoldDuotone } from 'solar-icon-set';

interface SignInButtonProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const SignInButton = ({ label, onClick, isLoading }: SignInButtonProps) => {
  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      onClick={onClick}
      disabled={isLoading}
      leftIcon={<BoltBoldDuotone className="w-5 h-5 mr-1 shrink-0 text-amber-300" />}
    >
      {label}
    </Button>
  );
};
