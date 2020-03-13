import chai, {assert} from 'chai';
import chaiHttp from 'chai-http';
import {describe, before} from 'mocha';
import faker from 'faker';
import sequelize from '../sequelize/sequelize';

import User from '../models/User';
import app from '../app';

chai.use(chaiHttp);

before('Database setup', function () {
    sequelize()
})
describe('Users routes/controllers', function () {
    describe('Registration', function () {
        describe('Username', function () {
            it('Fails when username is not present', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({})).body;
                assert.equal(message, "child \"username\" fails because [\"username\" is required]");

            });
            it('Fails when username is empty', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({username: ""})).body;
                assert.equal(message, "child \"username\" fails because [\"username\" is not allowed to be empty]");

            });
            it('Fails when username is too long', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).padEnd(17, '0123456789')})).body;
                assert.equal(message, "child \"username\" fails because [\"username\" length must be less than or equal to 16 characters long]");
            });
        });
        describe('Name', function () {
            it('Fails when name is not present', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16)})).body;
                assert.equal(message, "child \"name\" fails because [\"name\" is required]");
            });
            it('Fails when name is empty', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16),
                        name: ""
                    })).body;
                assert.equal(message, "child \"name\" fails because [\"name\" is not allowed to be empty]");

            });
            it('Fails when name is too long', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16),
                        name: faker.name.firstName().padEnd(33)
                    })).body;
                assert.equal(message, "child \"name\" fails because [\"name\" length must be less than or equal to 32 characters long]");
            });
        });
        describe('Password', function () {
            it('Fails when password is not present', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16),
                        name: faker.name.findName(faker.name.firstName(), faker.name.lastName()).substring(0, 32)
                    })).body;
                assert.equal(message, "child \"password\" fails because [\"password\" is required]");
            });
            it('Fails when password is empty', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16),
                        name: faker.name.findName(faker.name.firstName(), faker.name.lastName()).substring(0, 32),
                        password: ""
                    })).body;
                assert.equal(message, "child \"password\" fails because [\"password\" is not allowed to be empty]");

            });
            it('Fails when password is too long', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16),
                        name: faker.name.findName(faker.name.firstName(), faker.name.lastName()).substring(0, 32),
                        password: faker.internet.password(51, false, /[a-zA-Z0-9 `~!@#$%^&*()\-_+=[\]{};:'"<>,./?\\]+/)
                    })).body;
                assert.equal(message, "child \"password\" fails because [\"password\" length must be less than or equal to 50 characters long]");
            });
            it('Fails when password has invalid characters', async function () {
                const password = faker.internet.password(50, false, /[^a-zA-Z0-9 `~!@#$%^&*()\-_+=[\]{};:'"<>,./?\\]+/);
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16),
                        name: faker.name.findName(faker.name.firstName(), faker.name.lastName()).substring(0, 32),
                        password
                    })).body;
                assert.equal(message, `child "password" fails because ["password" with value "${password}" fails to match the required pattern: /[a-zA-Z0-9 \`~!@#$%^&*()\\-_+=[\\]{};:'"<>,./?\\\\]+/]`);
            });
        });
        describe('Valid data', function () {
            const username = faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16);
            before('Make sure the username is not taken', async function () {
                const user: User = await User.findOne({
                    where: {
                        username
                    }
                });
                if (user) {
                    await user.destroy();
                }
            });

            it('Registration succeeds with valid data', async function () {
                const user: {
                    id: number,
                    username: string,
                    name: string,
                    updatedAt: Date,
                    createdAt: Date
                } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: username,
                        name: faker.name.findName(faker.name.firstName(), faker.name.lastName()).substring(0, 32),
                        password: faker.internet.password(50, false, /[a-zA-Z0-9 `~!@#$%^&*()\-_+=[\]{};:'"<>,./?\\]+/)
                    })).body;
                assert.exists(user);
                assert.equal(username, user.username);
            });

            it('Registration fails with a duplicate username', async function () {
                const {message}: { message: string } = (await chai.request(app)
                    .post('/users')
                    .send({
                        username: username,
                        name: faker.name.findName(faker.name.firstName(), faker.name.lastName()).substring(0, 32),
                        password: faker.internet.password(50, false, /[a-zA-Z0-9 `~!@#$%^&*()\-_+=[\]{};:'"<>,./?\\]+/)
                    })).body;
                assert.equal(message, "An account with that username already exists.");
            });
        })
    });
});