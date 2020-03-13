const fs = require('fs');
const path = process.env.GITHUB_WORKSPACE;
fs.copyFileSync(`${path}/config/database.json.example`, `${path}/config/database.json`);
fs.copyFileSync(`${path}/config/redis.json.example`, `${path}/config/redis.json`);

const session = {
    development: {
        sessionSecrets: ['dev']
    },
    test: {
        sessionSecrets: ['test']
    },
    production: {
        sessionSecrets: ['prod']
    }
}
fs.writeFileSync(`${path}/config/session.json`, session, {})

const database = {
    development: {
        username: "root",
        password: "password",
        database: "database_development",
        host: "127.0.0.1",
        dialect: "mysql",
        operatorsAliases: false
    },
    test: {
        username: "root",
        password: "password",
        database: "database_development",
        host: "127.0.0.1",
        dialect: "mysql",
        operatorsAliases: false
    },
    production: {
        username: "root",
        password: "password",
        database: "database_development",
        host: "127.0.0.1",
        dialect: "mysql",
        operatorsAliases: false
    }
}
