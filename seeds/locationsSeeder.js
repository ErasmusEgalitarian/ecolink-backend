const Location = require('../models/Location');
const EcoPoint = require('../models/EcoPoint');

const LOCATIONS = [
    {
        name: 'FS - Faculdade de Ciências da Saúde',
        address: 'Faculdade de Medicina Faculdade de Ciências de Saúde Campos Univ. Darcy Ribeiro s/n - Asa Norte, Brasília - DF, 70910-900',
        coordinates: {
            type: 'Point',
            coordinates: [-47.86620142540902, -15.768323556727253]
        },
        imageFilename: 'fs.jpg',
        operatingHours: '08:00-18:00',
        isExtern: false,
        ecopoints: [
            {
                label: 'Ecoponto FS',
                acceptedMaterials: ['plastic', 'paper', 'metal', 'glass'],
                status: 'open',
                qrCode: 'fs-main'
            }
        ]
    },
    {
        name: 'Fiocruz - Fundação Oswaldo Cruz - Distrito Federal',
        address: 'Avenida L3 Norte, s/n, Campus Universitário Darcy Ribeiro, Gleba A, Brasília - DF, 70904-130',
        coordinates: {
            type: 'Point',
            coordinates: [-47.87115216106428, -15.770781435533308]
        },
        imageFilename: 'fiocruz.jpg',
        operatingHours: '08:00-18:00',
        isExtern: false,
        ecopoints: [
            {
                label: 'Ecoponto Fiocruz',
                acceptedMaterials: ['plastic', 'paper', 'metal', 'glass'],
                status: 'open',
                qrCode: 'fiocruz-main'
            }
        ]
    },
    {
        name: 'ICC Centro (proximo ao MGEO)',
        address: 'ICC Ala Centro, Sala AT 276/18 - Asa Norte, Brasília - DF, 70910-900',
        coordinates: {
            type: 'Point',
            coordinates: [-47.86871851598256, -15.763867068468066]
        },
        imageFilename: 'icc.png',
        operatingHours: '08:00-18:00',
        isExtern: false,
        ecopoints: [
            {
                label: 'Ecoponto ICC Centro',
                acceptedMaterials: ['plastic', 'paper', 'metal', 'glass'],
                status: 'open',
                qrCode: 'icc-centro-main'
            }
        ]
    },
    {
        name: 'Restaurante Universitário - RU UnB',
        address: 'UnB - Plano Piloto, Brasília - DF, 70297-400',
        coordinates: {
            type: 'Point',
            coordinates: [-47.87058317073011, -15.764231143679877]
        },
        imageFilename: 'ru.jpg',
        operatingHours: '11:00-14:00',
        isExtern: false,
        ecopoints: [
            {
                label: 'Ecoponto RU',
                acceptedMaterials: ['plastic', 'paper', 'metal', 'glass'],
                status: 'open',
                qrCode: 'ru-main'
            }
        ]
    },
    {
        name: 'Faculdade de Tecnologia da UnB',
        address: 'UnB - Plano Piloto, Brasília - DF',
        coordinates: {
            type: 'Point',
            coordinates: [-47.87228656550575, -15.763078747581929]
        },
        imageFilename: 'ft.jpg',
        operatingHours: '08:00-18:00',
        isExtern: false,
        ecopoints: [
            {
                label: 'Ecoponto FT',
                acceptedMaterials: ['plastic', 'paper', 'metal', 'glass'],
                status: 'open',
                qrCode: 'ft-main'
            }
        ]
    },
    {
        name: 'Faculdade de Direito da UnB',
        address: 'Faculdade de Direito UnB - Universidade de Brasília Campus Universitário Darcy Ribeiro - Asa Norte, Brasília - DF, 70904-970',
        coordinates: {
            type: 'Point',
            coordinates: [-47.87196006606473, -15.759457677369616]
        },
        imageFilename: 'fd.jpg',
        operatingHours: '08:00-18:00',
        isExtern: false,
        ecopoints: [
            {
                label: 'Ecoponto FD',
                acceptedMaterials: ['plastic', 'paper', 'metal', 'glass'],
                status: 'open',
                qrCode: 'fd-main'
            }
        ]
    }
];

const seedLocations = async () => {
    try {
        for (const locationData of LOCATIONS) {
            const { ecopoints, imageFilename, ...locationFields } = locationData;
            const imageUrl = `locations/${imageFilename}`;

            let location = await Location.findOne({ name: locationFields.name });
            if (!location) {
                location = await Location.create({ ...locationFields, imageUrl });
                console.log(`Location ${locationFields.name} created.`);
            } else {
                await Location.updateOne(
                    { _id: location._id },
                    { $set: { ...locationFields, imageUrl } }
                );
                console.log(`Location ${locationFields.name} updated.`);
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
