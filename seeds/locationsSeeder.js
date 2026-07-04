const Location = require('../models/Location');
const EcoPoint = require('../models/EcoPoint');
const { getUploadUrl } = require('../utils/publicUrl');

const LOCATIONS = [
    {
        name: 'BCE - Biblioteca Central',
        address: 'Universidade de Brasília - Campus Universitário Darcy Ribeiro, Gleba A - Asa Norte, Brasília - DF, 70910-900',
        coordinates: {
            type: 'Point',
            coordinates: [-47.8702, -15.7634]
        },
        imageFilename: 'bce.png',
        operatingHours: 'Aberto 24h',
        isExtern: false,
        ecopoints: [
            {
                label: 'Caixa entrada principal',
                acceptedMaterials: ['paper', 'metal', 'glass'],
                status: 'full',
                qrCode: 'bce-paper-metal-glass'
            },
            {
                label: 'Container plástico',
                acceptedMaterials: ['plastic'],
                status: 'open',
                qrCode: 'bce-plastic'
            }
        ]
    },
    {
        name: 'ICC - Instituto de Ciência da Computação',
        address: 'Universidade de Brasília - Campus Universitário Darcy Ribeiro, Asa Norte, Brasília - DF',
        coordinates: {
            type: 'Point',
            coordinates: [-47.8708, -15.7651]
        },
        imageFilename: 'icc.png',
        operatingHours: '08:00-18:00',
        isExtern: false,
        ecopoints: [
            {
                label: 'Ecoponto ICC',
                acceptedMaterials: ['plastic', 'paper', 'metal'],
                status: 'open',
                qrCode: 'icc-main'
            }
        ]
    }
];

const seedLocations = async () => {
    try {
        for (const locationData of LOCATIONS) {
            const { ecopoints, imageFilename, ...locationFields } = locationData;
            const imageUrl = getUploadUrl(imageFilename);

            let location = await Location.findOne({ name: locationFields.name });
            if (!location) {
                location = await Location.create({ ...locationFields, imageUrl });
                console.log(`Location ${locationFields.name} created.`);
            } else {
                await Location.updateOne(
                    { _id: location._id },
                    { $set: { imageUrl } }
                );
                console.log(`Location ${locationFields.name} image updated.`);
            }

            for (const ecopointData of ecopoints) {
                const exists = await EcoPoint.findOne({ qrCode: ecopointData.qrCode });
                if (!exists) {
                    await EcoPoint.create({
                        ...ecopointData,
                        locationId: location._id
                    });
                    console.log(`EcoPoint ${ecopointData.label} created for ${locationFields.name}.`);
                }
            }
        }
    } catch (err) {
        console.error('Error seeding locations:', err);
    }
};

module.exports = seedLocations;

seedLocations();
