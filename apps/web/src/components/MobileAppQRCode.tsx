import React, { useEffect, useMemo, useState } from "react";

export function MobileAppQRCode(props: { size?: number; path?: string }) {
  const size = props.size || 92;
  const path = props.path || "/m";
  const [dataUrl, setDataUrl] = useState<string>("");

  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin + path;
  }, [path]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!url) return;
      try {
        const QRCode = (await import("qrcode")).default;
        const next = await QRCode.toDataURL(url, {
          margin: 1,
          width: size,
          color: { dark: "#0b1020", light: "#ffffff" },
        });
        if (!cancelled) setDataUrl(next);
      } catch {
        if (!cancelled) setDataUrl("");
      }
    })();
    return () => { cancelled = true; };
  }, [url, size]);

  if (!dataUrl) return null;

  return (
    <a href={url} title="Open mobile capture (/m)" style={{ display: "inline-flex" }}>
      <img
        src={dataUrl}
        alt="QR code to open mobile capture"
        width={size}
        height={size}
        style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,.14)" }}
      />
    </a>
  );
}

