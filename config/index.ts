import databaseConfig from './database.json';
import passwordConfig from './passwords.json';
import sessionConfig from './session.json';
import redisConfig from './redis.json';
import {Dialect, OperatorsAliases} from "sequelize";

const env = process.env.NODE_ENV || 'development';

type DatabaseConfig = {
    "username": string,
    "password": string,
    "database": string,
    "host": string,
    "dialect": Dialect,
    "operatorsAliases": OperatorsAliases
}
export const database: DatabaseConfig = databaseConfig[env];

type PasswordConfig = {
    saltRounds: number
}
export const passwords: PasswordConfig = passwordConfig[env];

type SessionConfig = {
    sessionSecrets: string[]
}
export const session: SessionConfig = sessionConfig[env];

type RedisConfig = {
    host: string,
    port: number,
    password?: string,
    db?: string | number
}
export const redis: RedisConfig = redisConfig[env];