/**
 * Normalizes raw QR scan payloads into the ecopoint qrCode stored in the database.
 * Supports plain codes (bce-plastic) and URLs with ?q= or path segments.
 */
const normalizeQrCodeFromScan = (rawValue) => {
    if (typeof rawValue !== 'string') {
        return '';
    }

    const trimmed = rawValue.trim();
    if (!trimmed) {
        return '';
    }

    const looksLikeUrl = /^https?:\/\//i.test(trimmed);
    if (!looksLikeUrl) {
        return trimmed;
    }

    try {
        const url = new URL(trimmed);
        const queryCode = url.searchParams.get('q') || url.searchParams.get('qrCode');
        if (queryCode?.trim()) {
            return queryCode.trim();
        }

        const segments = url.pathname.split('/').filter(Boolean);
        const lastSegment = segments.at(-1);
        if (lastSegment?.trim()) {
            return decodeURIComponent(lastSegment.trim());
        }
    } catch {
        return trimmed;
    }

    return trimmed;
};

module.exports = {
    normalizeQrCodeFromScan
};
