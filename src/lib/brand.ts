const rawName = (process.env.NEXT_PUBLIC_APP_NAME || "").trim();
const rawDescription = (process.env.NEXT_PUBLIC_APP_DESCRIPTION || "").trim();

export const APP_NAME = rawName || "ScanRook";
export const APP_DESCRIPTION =
  rawDescription || "Installed-state-first vulnerability scanning for containers, ISO images, and binaries.";
