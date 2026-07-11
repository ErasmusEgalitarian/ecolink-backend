const ContentArticle = require('../models/ContentArticle');
const User = require('../models/User');
const { ROLE_IDS } = require('../constants/roles');

const SAMPLE_ARTICLES = [
    {
        slug: 'como-funciona-o-ecolink',
        category: 'getting_started',
        format: 'article',
        status: 'published',
        featured: true,
        translations: {
            pt: {
                title: 'Como funciona o EcoLink?',
                excerpt: 'Entenda o fluxo de doação no campus em poucos passos.',
            },
            en: {
                title: 'How does EcoLink work?',
                excerpt: 'Understand the campus donation flow in a few steps.',
            },
        },
        blocks: [
            {
                type: 'paragraph',
                order: 0,
                content: {
                    pt: 'Para doar, crie uma conta com sua matrícula, encontre um ecoponto disponível, escaneie o QR Code e registre o material.',
                    en: 'To donate, create an account with your student ID, find an available ecopoint, scan the QR Code, and register the material.',
                },
            },
            {
                type: 'list',
                order: 1,
                items: [
                    {
                        pt: 'Cadastre-se no app',
                        en: 'Register in the app',
                    },
                    {
                        pt: 'Localize um ecoponto ativo',
                        en: 'Find an active ecopoint',
                    },
                    {
                        pt: 'Escaneie o QR Code e conclua a doação',
                        en: 'Scan the QR Code and complete the donation',
                    },
                ],
            },
        ],
    },
    {
        slug: 'separacao-de-plastico',
        category: 'material_types',
        format: 'mixed',
        status: 'published',
        translations: {
            pt: {
                title: 'Como separar plástico corretamente',
                excerpt: 'Dicas práticas para aumentar a qualidade do material coletado.',
            },
            en: {
                title: 'How to sort plastic correctly',
                excerpt: 'Practical tips to improve the quality of collected material.',
            },
        },
        blocks: [
            {
                type: 'paragraph',
                order: 0,
                content: {
                    pt: 'Lave garrafas e embalagens antes do descarte. Material limpo vale mais para as cooperativas.',
                    en: 'Wash bottles and packaging before disposal. Clean material is worth more to cooperatives.',
                },
            },
            {
                type: 'quote',
                order: 1,
                content: {
                    pt: 'Material seco e limpo reduz contaminação e facilita a reciclagem.',
                    en: 'Dry and clean material reduces contamination and makes recycling easier.',
                },
            },
        ],
    },
    {
        slug: 'impacto-das-doacoes',
        category: 'impact_stories',
        format: 'article',
        status: 'published',
        translations: {
            pt: {
                title: 'Impacto das doações no campus',
                excerpt: 'Cada doação contribui para a economia circular e para as cooperativas.',
            },
            en: {
                title: 'Donation impact on campus',
                excerpt: 'Each donation contributes to the circular economy and cooperatives.',
            },
        },
        blocks: [
            {
                type: 'paragraph',
                order: 0,
                content: {
                    pt: 'Os materiais doados pelos estudantes são encaminhados às cooperativas de reciclagem, gerando renda e reduzindo resíduos no campus.',
                    en: 'Materials donated by students are sent to recycling cooperatives, generating income and reducing waste on campus.',
                },
            },
        ],
    },
];

const seedContentArticles = async () => {
    try {
        const editor = await User.findOne({ roleId: ROLE_IDS.EDITOR });
        const fallbackAuthor = editor || await User.findOne();

        if (!fallbackAuthor) {
            console.log('Content seeder skipped: no users found.');
            return;
        }

        for (const articleData of SAMPLE_ARTICLES) {
            const exists = await ContentArticle.findOne({ slug: articleData.slug });
            if (exists) {
                continue;
            }

            await ContentArticle.create({
                ...articleData,
                authorId: fallbackAuthor._id,
                publishedAt: new Date(),
            });
            console.log(`Content article ${articleData.slug} created.`);
        }
    } catch (error) {
        console.error('Error seeding content articles:', error);
    }
};

seedContentArticles();

module.exports = { seedContentArticles };
