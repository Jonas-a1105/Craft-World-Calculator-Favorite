import { EncyclopediaDashboard } from '../modules/encyclopedia';

interface Props {
  mode?: 'encyclopedia' | 'events';
}

export default function Encyclopedia({ mode = 'encyclopedia' }: Props) {
  return <EncyclopediaDashboard mode={mode} />;
}
