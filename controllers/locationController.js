const Location = require('../models/Location');
const EcoPoint = require('../models/EcoPoint');
const { nearbyEcopointSchema } = require('../schemas/ecopointSchemas');
const { locationIdSchema } = require('../schemas/locationSchemas');
const {
    buildAvailableLocationsPipeline,
    enrichLocationWithEcopoints
} = require('../utils/locationHelpers');

/**
 * @description Lista locais com ecopontos a partir de uma posição,
 *              ordenados por prioridade de status (open > full > closed > offline) e distância.
 * @route GET /api/locations/available
 * @access Private
 */
const getAvailableLocations = async (req, res, next) => {
    try {
        const parsed = nearbyEcopointSchema.safeParse(req.query);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        const { lat, lng, maxDistance, materialType, limit } = parsed.data;

        const locations = await Location.aggregate(
            buildAvailableLocationsPipeline({ lat, lng, maxDistance, materialType, limit })
        );

        const available = locations.some((location) =>
            (location.ecopoints || []).some((ecopoint) => ecopoint.status === 'open')
        );

        res.status(200).json({
            success: true,
            available,
            count: locations.length,
            data: locations
        });
    } catch (error) {
        console.error('Error fetching available locations:', error);
        next(error);
    }
};

/**
 * @description Retorna um local com seus ecopontos ordenados por status.
 * @route GET /api/locations/:id
 * @access Private
 */
const getLocationById = async (req, res, next) => {
    try {
        const parsed = locationIdSchema.safeParse({ id: req.params.id });

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        const location = await Location.findById(parsed.data.id).lean();

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const ecopoints = await EcoPoint.find({ locationId: location._id })
            .select('label acceptedMaterials status qrCode')
            .lean();

        res.status(200).json({
            success: true,
            data: enrichLocationWithEcopoints(location, ecopoints)
        });
    } catch (error) {
        console.error('Error fetching location by id:', error);
        next(error);
    }
};

module.exports = {
    getAvailableLocations,
    getLocationById
};
