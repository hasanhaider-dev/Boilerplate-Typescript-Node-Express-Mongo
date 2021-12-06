import convict from "convict";

const conf = convict({
    env: {
        format: ['development', 'production', 'test'],
        default: 'development',
        env: 'NODE_ENV',
    },
    server: {
        port: {
            format: 'port',
            default: 3005,
            env: 'APP_PORT',
        },
    },
    database: {
        host: {
            format: '*',
            default: '127.0.0.1',
            env: 'DB_HOSTNAME',
        },
        port: {
            format: 'port',
            default: 27017,
            env: 'DB_PORT',
        },
        name: {
            format: '*',
            default: 'boilerplate',
            env: 'DB_NAME',
        },
        username: {
            format: '*',
            default: 'admin',
            env: 'DB_USERNAME',
        },
        password: {
            format: '*',
            default: 'admin',
            env: 'DB_PASSWORD',
        },
        poolSize: {
            format: '*',
            default: 10,
            env: 'POOL_SIZE',
        },
    },
});

conf.validate({ allowed: 'strict' });

export default conf.getProperties();
