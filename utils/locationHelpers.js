const MATERIALS = ['plastic', 'metal', 'glass', 'paper'];
const STATUSES = ['open', 'full', 'closed', 'offline'];

const getStatusPriority = (status) => {
    switch (status) {
        case 'open':
            return 0;
        case 'full':
            return 1;
        case 'closed':
            return 2;
        case 'offline':
            return 3;
        default:
            return 4;
    }
};

const sortEcopointsByStatus = (ecopoints = []) =>
    [...ecopoints].sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));

const unionMaterials = (ecopoints = []) => {
    const materials = new Set();
    ecopoints.forEach((ecopoint) => {
        (ecopoint.acceptedMaterials || []).forEach((material) => materials.add(material));
    });
    return MATERIALS.filter((material) => materials.has(material));
};

const deriveLocationStatus = (ecopoints = []) => {
    if (ecopoints.some((ecopoint) => ecopoint.status === 'open')) {
        return 'open';
    }
    if (ecopoints.some((ecopoint) => ecopoint.status === 'full')) {
        return 'full';
    }
    if (ecopoints.some((ecopoint) => ecopoint.status === 'closed')) {
        return 'closed';
    }
    return 'offline';
};

const enrichLocationWithEcopoints = (location, ecopoints) => {
    const sortedEcopoints = sortEcopointsByStatus(ecopoints);
    const status = deriveLocationStatus(sortedEcopoints);

    return {
        ...location,
        ecopoints: sortedEcopoints,
        acceptedMaterials: unionMaterials(sortedEcopoints),
        status
    };
};

const ecopointStatusPriorityExpression = (statusField) => ({
    $switch: {
        branches: [
            { case: { $eq: [statusField, 'open'] }, then: 0 },
            { case: { $eq: [statusField, 'full'] }, then: 1 },
            { case: { $eq: [statusField, 'closed'] }, then: 2 },
            { case: { $eq: [statusField, 'offline'] }, then: 3 }
        ],
        default: 4
    }
});

const buildAvailableLocationsPipeline = ({ lat, lng, maxDistance, materialType, limit }) => {
    const ecopointMatch = {};
    if (materialType) {
        ecopointMatch.acceptedMaterials = materialType;
    }

    const geoNear = {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        spherical: true,
        query: {}
    };

    if (maxDistance) {
        geoNear.maxDistance = maxDistance;
    }

    return [
        { $geoNear: geoNear },
        {
            $lookup: {
                from: 'ecopoints',
                localField: '_id',
                foreignField: 'locationId',
                as: 'ecopoints',
                pipeline: [
                    { $match: ecopointMatch },
                    {
                        $project: {
                            label: 1,
                            acceptedMaterials: 1,
                            status: 1,
                            qrCode: 1
                        }
                    }
                ]
            }
        },
        { $match: { 'ecopoints.0': { $exists: true } } },
        {
            $addFields: {
                ecopoints: {
                    $sortArray: {
                        input: {
                            $map: {
                                input: '$ecopoints',
                                as: 'ecopoint',
                                in: {
                                    $mergeObjects: [
                                        '$$ecopoint',
                                        {
                                            statusPriority: ecopointStatusPriorityExpression('$$ecopoint.status')
                                        }
                                    ]
                                }
                            }
                        },
                        sortBy: { statusPriority: 1 }
                    }
                }
            }
        },
        {
            $addFields: {
                ecopoints: {
                    $map: {
                        input: '$ecopoints',
                        as: 'ecopoint',
                        in: {
                            _id: '$$ecopoint._id',
                            label: '$$ecopoint.label',
                            acceptedMaterials: '$$ecopoint.acceptedMaterials',
                            status: '$$ecopoint.status',
                            qrCode: '$$ecopoint.qrCode'
                        }
                    }
                },
                distance: { $round: ['$distance', 0] },
                acceptedMaterials: {
                    $reduce: {
                        input: '$ecopoints',
                        initialValue: [],
                        in: { $setUnion: ['$$value', '$$this.acceptedMaterials'] }
                    }
                },
                status: {
                    $cond: [
                        {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: '$ecopoints',
                                            as: 'ecopoint',
                                            cond: { $eq: ['$$ecopoint.status', 'open'] }
                                        }
                                    }
                                },
                                0
                            ]
                        },
                        'open',
                        {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$ecopoints',
                                                    as: 'ecopoint',
                                                    cond: { $eq: ['$$ecopoint.status', 'full'] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                'full',
                                {
                                    $cond: [
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $filter: {
                                                            input: '$ecopoints',
                                                            as: 'ecopoint',
                                                            cond: { $eq: ['$$ecopoint.status', 'closed'] }
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        'closed',
                                        'offline'
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        {
            $addFields: {
                statusPriority: ecopointStatusPriorityExpression('$status')
            }
        },
        { $sort: { statusPriority: 1, distance: 1 } },
        { $limit: limit },
        { $project: { statusPriority: 0, __v: 0 } }
    ];
};

const ECOPOINT_WITH_LOCATION_POPULATE = {
    path: 'ecopointId',
    select: 'label status acceptedMaterials qrCode locationId',
    populate: {
        path: 'locationId',
        select: 'name address coordinates imageUrl operatingHours isExtern'
    }
};

module.exports = {
    MATERIALS,
    STATUSES,
    getStatusPriority,
    sortEcopointsByStatus,
    unionMaterials,
    deriveLocationStatus,
    enrichLocationWithEcopoints,
    buildAvailableLocationsPipeline,
    ECOPOINT_WITH_LOCATION_POPULATE
};
