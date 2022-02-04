require('reflect-metadata')
const path = require('path')

const outputRoot = path.join(__dirname, 'dist')
const modelsRoot = path.join(outputRoot, 'models', '*.js')

module.exports = {
    type: 'mongodb',
    name: 'default',
    database: 'yonebot',
    extra: {
        useUnifiedTopology: true,
    },
    entities: [modelsRoot],
    synchronize: false,
    url: process.env.MONGO_URL,
}
