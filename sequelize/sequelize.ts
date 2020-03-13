import {Sequelize} from 'sequelize-typescript';
import {database} from "../config";
import User from "../models/User";

const sequelize = new Sequelize({
    ...database,
    logging: process.env.NODE_ENV !== 'test'
})
export default () => {
    sequelize.addModels([User]);
}