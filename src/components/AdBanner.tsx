import React, { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full text-center my-8 overflow-hidden bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4 min-h-[100px] flex items-center justify-center">
      {/* 
        NOTE: En développement ou avant validation par Google, 
        cet espace restera vide ou affichera un espace réservé.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // REMPLACEZ PAR VOTRE ID CLIENT
        data-ad-slot={dataAdSlot}                // REMPLACEZ PAR L'ID DE VOTRE BLOC D'ANNONCE
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
      />
      
      {/* Message indicatif pour le mode développement (optionnel, peut être retiré) */}
      <span className="text-sm text-gray-400 absolute pointer-events-none">
        Emplacement Publicitaire (Google AdSense)
      </span>
    </div>
  );
}
