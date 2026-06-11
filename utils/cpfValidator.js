const isValidCPF = (cpf) => {
    const regex = /^\d{11}$/;
    if (!regex.test(cpf)) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i), 10) * (10 - i);
    }

    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i), 10) * (11 - i);
    }

    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;

    return checkDigit === parseInt(cpf.charAt(10), 10);
};

module.exports = { isValidCPF };
