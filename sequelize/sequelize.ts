import {Sequelize} from 'sequelize-typescript';
import {database} from "../config";

const sequelize = new Sequelize({
    ...database
})
export default () => {
    sequelize.addModels([]);
}