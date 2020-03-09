import databaseConfig from './database.json';
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