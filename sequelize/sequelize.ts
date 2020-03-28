import {Sequelize} from 'sequelize-typescript';
import {database} from "../config";
import User from "../models/User";
import InventoryEntry from "../models/InventoryEntry";

const sequelize = new Sequelize({
    ...database,
    logging: process.env.NODE_ENV !== 'test'
})
export default () => {
    sequelize.addModels([User, InventoryEntry]);
}