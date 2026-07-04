const Location = require('../models/Location');
const EcoPoint = require('../models/EcoPoint');
const { qrCodeParamSchema } = require('../schemas/ecopointSchemas');
const { getAvailableLocations } = require('./locationController');
const { normalizeQrCodeFromScan } = require('../utils/qrCodeHelpers');

const mapEcopointForQrResponse = (ecopoint, location) => ({
    id: ecopoint._id.toString(),
    label: ecopoint.label,
    status: ecopoint.status,
    acceptedMaterials: ecopoint.acceptedMaterials,
    qrCode: ecopoint.qrCode,
    locationId: ecopoint.locationId.toString(),
    locationName: location?.name ?? '',
    locationAddress: location?.address ?? ''
});

/**
 * @description Alias de compatibilidade para GET /api/ecopoints/available.
 *              Retorna locais próximos com ecopontos aninhados.
 * @route GET /api/ecopoints/available
 * @access Private
 */
const getAvailableEcopoints = getAvailableLocations;

/**
 * @description Resolve um ecoponto a partir do valor escaneado no QR code.
 * @route GET /api/ecopoints/by-qrcode/:qrCode
 * @access Private
 */
const getEcopointByQrCode = async (req, res, next) => {
    try {
        const normalizedQrCode = normalizeQrCodeFromScan(req.params.qrCode);
        const parsed = qrCodeParamSchema.safeParse({ qrCode: normalizedQrCode });

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: parsed.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        const ecopoint = await EcoPoint.findOne({ qrCode: parsed.data.qrCode }).lean();

        if (!ecopoint) {
            return res.status(404).json({
                success: false,
                message: 'EcoPoint not found for this QR code'
            });
        }

        if (ecopoint.status !== 'open') {
            return res.status(409).json({
                success: false,
                message: `EcoPoint is not available for donations (status: ${ecopoint.status})`,
                ecopoint: {
                    id: ecopoint._id.toString(),
                    label: ecopoint.label,
                    status: ecopoint.status,
                    qrCode: ecopoint.qrCode
                }
            });
        }

        const location = await Location.findById(ecopoint.locationId)
            .select('name address')
            .lean();

        res.status(200).json({
            success: true,
            ecopoint: mapEcopointForQrResponse(ecopoint, location)
        });
    } catch (error) {
        console.error('Error resolving ecopoint by QR code:', error);
        next(error);
    }
};

module.exports = {
    getAvailableEcopoints,
    getEcopointByQrCode
};
