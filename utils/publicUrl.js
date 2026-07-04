const getPublicBaseUrl = () => {
    const configured = process.env.API_PUBLIC_URL || process.env.PUBLIC_API_URL;
    if (configured) {
        return configured.replace(/\/$/, '');
    }

    const port = process.env.PORT || 5000;
    return `http://localhost:${port}`;
};

const getUploadUrl = (filename) => `${getPublicBaseUrl()}/uploads/${filename}`;

module.exports = {
    getPublicBaseUrl,
    getUploadUrl
};
