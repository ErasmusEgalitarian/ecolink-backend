/**
 * Monta URLs públicas de arquivos estáticos (uploads).
 *
 * Prioridade da base:
 * 1. API_PUBLIC_URL (ou PUBLIC_API_URL) — recomendado em produção e no app físico
 * 2. Host da requisição HTTP — útil em dev web quando o client acessa o mesmo host
 * 3. http://localhost:{PORT} — fallback local
 */

const getPublicBaseUrl = (req) => {
    const configured = process.env.API_PUBLIC_URL || process.env.PUBLIC_API_URL;
    if (configured) {
        return configured.replace(/\/$/, '');
    }

    if (req?.get?.('host')) {
        const protocol = req.protocol || 'http';
        return `${protocol}://${req.get('host')}`;
    }

    const port = process.env.PORT || 5000;
    return `http://localhost:${port}`;
};

/** Normaliza valor salvo no banco para caminho relativo dentro de /uploads. */
const extractUploadRelativePath = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }

    if (!/^https?:\/\//i.test(trimmed)) {
        return trimmed
            .replace(/^\/uploads\//, '')
            .replace(/^uploads\//, '');
    }

    try {
        const { pathname } = new URL(trimmed);
        const match = pathname.match(/\/uploads\/(.+)$/);
        return match ? decodeURIComponent(match[1]) : '';
    } catch {
        return '';
    }
};

const getUploadUrl = (relativePath, req) => {
    const normalizedPath = extractUploadRelativePath(relativePath);
    if (!normalizedPath) {
        return '';
    }

    return `${getPublicBaseUrl(req)}/uploads/${normalizedPath}`;
};

/** Converte caminho relativo ou URL legada em URL absoluta para o client. */
const resolveImageUrl = (storedValue, req) => {
    if (!storedValue) {
        return '';
    }

    const relativePath = extractUploadRelativePath(storedValue);
    if (!relativePath) {
        return storedValue;
    }

    return getUploadUrl(relativePath, req);
};

module.exports = {
    getPublicBaseUrl,
    extractUploadRelativePath,
    getUploadUrl,
    resolveImageUrl,
};
