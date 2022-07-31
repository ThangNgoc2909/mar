exports.validateEmail = (email) => {
    return String(email).toLowerCase().match(/([a-zA-Z0-9]+)([\_\.\-{1}])?([a-zA-Z0-9]+)\@([a-zA-Z0-9]+)([\.])([a-zA-Z\.]+)/g);
}
