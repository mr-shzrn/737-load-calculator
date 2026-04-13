import React, { useRef, useEffect, useState } from 'react';
import { decodeDelivery } from '../../utils/deliveryMode.js';

export default function DeliveryScanner({ expectedReg, onScan, onClose }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const activeRef  = useRef(true);
  const [status, setStatus] = useState('Starting camera…');
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setError('QR scanning requires iPadOS 17 or later. Please enter the delivery code manually.');
      return;
    }

    let detector;

    const scan = async () => {
      if (!activeRef.current || !videoRef.current) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const data = decodeDelivery(barcodes[0].rawValue);
          if (!data) {
            setStatus('QR found but not a valid delivery code — try again.');
          } else if (expectedReg && data.reg !== expectedReg) {
            setStatus(`QR is for ${data.reg}, not ${expectedReg}. Select that registration first.`);
          } else {
            stop();
            onScan(data);
            return;
          }
        }
      } catch (_) {}
      if (activeRef.current) requestAnimationFrame(scan);
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (!activeRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        detector = new BarcodeDetector({ formats: ['qr_code'] });
        setStatus('Point camera at the delivery QR code');
        requestAnimationFrame(scan);
      } catch (err) {
        setError(`Camera error: ${err.message || 'Permission denied.'}`);
      }
    };

    const stop = () => {
      activeRef.current = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };

    start();
    return stop;
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Video */}
      <div className="relative w-full max-w-xs mx-auto">
        <video
          ref={videoRef}
          className="w-full rounded-2xl"
          playsInline
          muted
          style={{ background: '#111' }}
        />
        {/* Alignment frame */}
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-2xl"
              style={{
                width: 200, height: 200,
                border: '2px solid rgba(255,255,255,0.7)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              }}
            />
          </div>
        )}
      </div>

      <p className="text-white text-[14px] mt-6 px-6 text-center leading-relaxed">
        {error || status}
      </p>

      <button
        onClick={onClose}
        className="mt-8 px-8 py-3 rounded-2xl font-semibold text-[14px] text-white"
        style={{ background: 'rgba(255,255,255,0.18)' }}
      >
        Cancel
      </button>
    </div>
  );
}
