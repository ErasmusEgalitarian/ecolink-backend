const { getAvailableLocations } = require('./locationController');

/**
 * @description Alias de compatibilidade para GET /api/ecopoints/available.
 *              Retorna locais próximos com ecopontos aninhados.
 * @route GET /api/ecopoints/available
 * @access Private
 */
const getAvailableEcopoints = getAvailableLocations;

module.exports = {
    getAvailableEcopoints
};
