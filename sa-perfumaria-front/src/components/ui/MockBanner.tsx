import { FlaskConical } from 'lucide-react';
import { env } from '@/config/env';

/** Aviso visível sempre que os dados exibidos forem fictícios. */
export function MockBanner() {
  if (!env.useMocks) return null;
  return (
    <div className="flex items-center justify-center gap-2 bg-ink px-4 py-1.5 text-center text-[11px] font-medium text-gold-light">
      <FlaskConical className="size-3.5" /> Modo demonstração — dados fictícios (VITE_USE_MOCKS=true). Nenhuma informação é enviada à API.
    </div>
  );
}
