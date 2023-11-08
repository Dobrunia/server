import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

export const config= {
    env: process.env.NODE_ENV,
    serverUrl: process.env.SERVER_URL,
    port: process.env.SERVER_PORT,
    cors: process.env.CORS_ORIGIN,
    accessKey: process.env.TOKEN_PRIVATE_ACCESS_KEY,
    refreshKey: process.env.TOKEN_PRIVATE_REFRESH_KEY,

    db: {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        database: process.env.SQL_DATABASE,
        pass: process.env.SQL_PASSWORD,
        poolSize: process.env.MAX_CONN_POOLSIZE
    },
    mail:{
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS
    }
}
