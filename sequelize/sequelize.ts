import {Sequelize} from 'sequelize-typescript';
import {database} from "../config";
import User from "../models/User";

const sequelize = new Sequelize({
    ...database
})
export default () => {
    sequelize.addModels([User]);
}