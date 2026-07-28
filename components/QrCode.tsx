import QR from 'qrcode';

/**
 * A real, scannable code — the printed card's entire job is that
 * somebody walking past can point a phone at it and land on the build.
 */
export async function QrCode({
  value,
  size = 78,
  dark = '#0B0B0C',
  light = '#FFFFFF',
}: {
  value: string;
  /** A number is CSS pixels; a string passes straight through, so the
      print cards can size their codes in their own `--u` units. */
  size?: number | string;
  dark?: string;
  light?: string;
}) {
  const svg = await QR.toString(value, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark, light },
  });

  return (
    <div
      style={{ width: size, height: size, flex: 'none', lineHeight: 0 }}
      // qrcode emits a self-contained <svg>; the value is our own URL.
      dangerouslySetInnerHTML={{
        __html: svg.replace('<svg', '<svg width="100%" height="100%"'),
      }}
    />
  );
}
