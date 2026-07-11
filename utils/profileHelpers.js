const fs = require('fs');
const path = require('path');

const PROFILE_UPLOAD_DIR = 'perfil';

const getMatriculaFromUser = (user) => {
    const localPart = (user.email || '').split('@')[0]?.trim() || '';
    const fromEmail = localPart.replace(/\D/g, '');

    if (fromEmail) {
        return fromEmail;
    }

    const fromCpf = String(user.cpf || '').replace(/\D/g, '');
    if (fromCpf) {
        return fromCpf;
    }

    return String(user._id);
};

const getProfileUploadAbsoluteDir = () =>
    path.join(__dirname, '..', 'uploads', PROFILE_UPLOAD_DIR);

const deleteExistingAvatarFiles = (matricula) => {
    const dir = getProfileUploadAbsoluteDir();
    if (!fs.existsSync(dir)) {
        return;
    }

    for (const file of fs.readdirSync(dir)) {
        if (path.parse(file).name === matricula) {
            fs.unlinkSync(path.join(dir, file));
        }
    }
};

const getProfileAvatarRelativePath = (filename) =>
    `${PROFILE_UPLOAD_DIR}/${filename}`;

module.exports = {
    PROFILE_UPLOAD_DIR,
    getMatriculaFromUser,
    getProfileUploadAbsoluteDir,
    deleteExistingAvatarFiles,
    getProfileAvatarRelativePath,
};
