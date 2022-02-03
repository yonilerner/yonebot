import './init'

export const globals = {
    DEV_SERVER_ID: process.env.DEV_SERVER_ID || '',
    NODE_ENV: process.env.NODE_ENV || 'prod',
    BOT_TOKEN: process.env.BOT_TOKEN || '',
}
