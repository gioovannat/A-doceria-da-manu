import { useEffect, useState } from 'react';

const CONSENT_KEY = 'doceria_manu_cookie_consent_v1';

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(CONSENT_KEY));
  }, []);

  const saveConsent = (choice: 'accepted' | 'essential_only') => {
    localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-[#FAD0DE] bg-white p-4 shadow-xl sm:flex sm:items-center sm:gap-4"
      role="dialog"
      aria-label="Preferências de cookies"
    >
      <p className="flex-1 text-[11px] leading-relaxed text-[#5E3B46]">
        Usamos cookies e armazenamento local essenciais para o funcionamento do site e para manter a sessão protegida na área de gestão. Você autoriza esse uso?
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => saveConsent('essential_only')}
          className="rounded-xl border border-[#FAD0DE] px-3 py-2 text-[11px] font-semibold text-[#7A505D] transition-colors hover:bg-[#FFF5F8]"
        >
          Apenas essenciais
        </button>
        <button
          type="button"
          onClick={() => saveConsent('accepted')}
          className="rounded-xl bg-[#D81E5B] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#B8134B]"
        >
          Aceitar
        </button>
      </div>
    </section>
  );
};
