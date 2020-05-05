import chai from 'chai';
import chaiHttp from 'chai-http';
import {describe, before} from 'mocha';
import sequelize from '../../sequelize/sequelize';

import app from "../../app";

import createEntryTest from './createEntry';
import getEntryFromIdTest from './getEntryFromId';
import searchTest from './search';

chai.use(chaiHttp);

before('Database setup', function () {
    sequelize()
})
describe('Inventory routes/controllers', function () {
    createEntryTest(chai, app);
    getEntryFromIdTest(chai, app);
    searchTest(chai, app);
});