'use client';

import QR from 'qrcode';
import { useEffect, useState } from 'react';

/**
 * Same code as <QrCode>, generated in the browser. The print sheet uses
 * the server component so the code is in the HTML before the page prints;
 * screens inside the app use this one.
 */
export function QrCodeClient({
  value,
  size = 78,
  dark = '#0B0B0C',
  light = '#FFFFFF',
}: {
  value: string;
  size?: number;
  dark?: string;
  light?: string;
}) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let live = true;
    QR.toString(value, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: { dark, light },
    })
      .then((s) => {
        if (live) setSvg(s.replace('<svg', '<svg width="100%" height="100%"'));
      })
      .catch(() => {
        /* Leave the space blank rather than show a broken code. */
      });
    return () => {
      live = false;
    };
  }, [value, dark, light]);

  return (
    <div
      style={{ width: size, height: size, flex: 'none', background: light, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
