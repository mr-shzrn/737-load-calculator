import React, { useEffect, useState, useRef } from 'react';
import { encodeDelivery } from '../../utils/deliveryMode.js';

export default function DeliveryQRCode({ deliveryData, collapsed = true }) {
  const [open,  setOpen]  = useState(!collapsed);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (!open || !deliveryData) return;
    let cancelled = false;
    import('qrcode').then(({ default: QRCode }) => {
      QRCode.toDataURL(encodeDelivery(deliveryData), {
        width: 240,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(url => { if (!cancelled) setQrUrl(url); });
    });
    return () => { cancelled = true; };
  }, [open, deliveryData]);

  if (!deliveryData) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-[12px] font-semibold"
        style={{ color: 'rgba(0,51,102,0.75)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="5" height="5" rx="0.5" />
          <rect x="16" y="3" width="5" height="5" rx="0.5" />
          <rect x="3" y="16" width="5" height="5" rx="0.5" />
          <path strokeLinecap="round" d="M16 16h5v5M16 16v5M21 16v.01M3 10h2M7 10h2M10 7V3M10 10v2M10 16v2M13 3h2M13 7h2M16 10h2M21 10h2M13 13h2M13 16h2M13 21h2M21 13v2" />
        </svg>
        {open ? 'Hide delivery QR' : 'Show delivery QR'}
      </button>

      {open && (
        <div className="mt-3 flex flex-col items-center gap-2">
          {qrUrl
            ? <img src={qrUrl} alt="Delivery QR" className="rounded-xl" style={{ width: 180, height: 180, imageRendering: 'pixelated' }} />
            : <div className="w-44 h-44 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <span className="text-[12px] muted">Generating…</span>
              </div>
          }
          <p className="text-[10px] muted text-center leading-relaxed">
            Scan on another device to restore<br />this delivery load
          </p>
          <p className="text-[10px] font-mono font-bold heading">{deliveryData.manifest}</p>
        </div>
      )}
    </div>
  );
}
