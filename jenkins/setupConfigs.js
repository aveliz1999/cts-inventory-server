const fs = require('fs');
const path = process.env.WORKSPACE;
console.log(`Working with WORKSPACE ${path}`);
fs.copyFileSync(`${path}/config/passwords.json.example`, `${path}/config/passwords.json`);
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
fs.writeFileSync(`${path}/config/session.json`, JSON.stringify(session))

const database = {
    development: {
        username: "root",
        password: "root",
        database: "database_development",
        host: "127.0.0.1",
        dialect: "mysql",
        operatorsAliases: false
    },
    test: {
        username: "root",
        password: "root",
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
        operatorsAliases: false
    },
    production: {
        username: "root",
        password: "root",
        database: "database_production",
        host: "127.0.0.1",
        dialect: "mysql",
        operatorsAliases: false
    }
}
fs.writeFileSync(`${path}/config/database.json`, JSON.stringify(database))
