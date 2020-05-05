import {before, describe} from "mocha";
import {assert} from "chai";
import faker from "faker";
import User from "../../models/User";

export default function (chai, app) {
    describe('Create inventory entry', function () {
        describe('Fails when not authenticated', async function () {
            const {message}: { message: string } = (await chai.request(app).post('/inventory')).body;
            assert.equal(message, "Must be logged in to access this route.");
        });
        describe('Authenticated', function () {
            let agent;
            before('Authenticate', async function () {
                agent = chai.request.agent(app);
                const username = faker.internet.userName(faker.name.firstName(), faker.name.lastName()).substring(0, 16);
                const password = faker.internet.password(50, false, /[a-zA-Z0-9 `~!@#$%^&*()\-_+=[\]{};:'"<>,./?\\]+/);
                const user: User = await User.findOne({
                    where: {
                        username
                    }
                });
                if (user) {
                    await user.destroy();
                }
                await agent
                    .post('/users')
                    .send({
                        username,
                        name: faker.name.findName(faker.name.firstName(), faker.name.lastName()).substring(0, 32),
                        password
                    });
                const returnedUser: User = (await agent
                    .post('/users/login')
                    .send({username, password})).body;
                assert.equal(returnedUser.username, username);
            });

            describe('Room', function () {
                it('Fails when room is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({})).body;
                    assert.equal(message, "child \"room\" fails because [\"room\" is required]");
                });

                it('Fails when room is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: 1
                        })).body;
                    assert.equal(message, "child \"room\" fails because [\"room\" must be a string]");
                });

                it('Fails when room is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: ''
                        })).body;
                    assert.equal(message, "child \"room\" fails because [\"room\" is not allowed to be empty]");
                });

                it('Fails when room is longer than 16 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"room\" fails because [\"room\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('Number', function () {
                it('Fails when number is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234'
                        })).body;
                    assert.equal(message, "child \"number\" fails because [\"number\" is required]");
                });

                it('Fails when number is not a number', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: ''
                        })).body;
                    assert.equal(message, "child \"number\" fails because [\"number\" must be a number]");
                });

                it('Fails when number is not positive', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 0
                        })).body;
                    assert.equal(message, "child \"number\" fails because [\"number\" must be a positive number]");
                });

                it('Fails when number is not an integer', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1.5
                        })).body;
                    assert.equal(message, "child \"number\" fails because [\"number\" must be an integer]");
                });
            });

            describe('Serial', function () {
                it('Fails when serial is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1
                        })).body;
                    assert.equal(message, "child \"serial\" fails because [\"serial\" is required]");
                });

                it('Fails when serial is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: 1
                        })).body;
                    assert.equal(message, "child \"serial\" fails because [\"serial\" must be a string]");
                });

                it('Fails when serial is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: ''
                        })).body;
                    assert.equal(message, "child \"serial\" fails because [\"serial\" is not allowed to be empty]");
                });

                it('Fails when serial is longer than 16 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"serial\" fails because [\"serial\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('Model', function () {
                it('Fails when model is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234'
                        })).body;
                    assert.equal(message, "child \"model\" fails because [\"model\" is required]");
                });

                it('Fails when model is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: 1
                        })).body;
                    assert.equal(message, "child \"model\" fails because [\"model\" must be a string]");
                });

                it('Fails when model is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: ''
                        })).body;
                    assert.equal(message, "child \"model\" fails because [\"model\" is not allowed to be empty]");
                });

                it('Fails when model is longer than 64 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: ''.padEnd(65, '0')
                        })).body;
                    assert.equal(message, "child \"model\" fails because [\"model\" length must be less than or equal to 64 characters long]");
                });
            });

            describe('CPU', function () {
                it('Fails when cpu is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234'
                        })).body;
                    assert.equal(message, "child \"cpu\" fails because [\"cpu\" is required]");
                });

                it('Fails when cpu is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: 1
                        })).body;
                    assert.equal(message, "child \"cpu\" fails because [\"cpu\" must be a string]");
                });

                it('Fails when cpu is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: ''
                        })).body;
                    assert.equal(message, "child \"cpu\" fails because [\"cpu\" is not allowed to be empty]");
                });

                it('Fails when cpu is longer than 64 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: ''.padEnd(65, '0')
                        })).body;
                    assert.equal(message, "child \"cpu\" fails because [\"cpu\" length must be less than or equal to 64 characters long]");
                });
            });

            describe('Clock Speed', function () {
                it('Fails when clockSpeed is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234'
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" is required]");
                });

                it('Fails when clockSpeed is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: 1
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" must be a string]");
                });

                it('Fails when clockSpeed is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: ''
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" is not allowed to be empty]");
                });

                it('Fails when clockSpeed is longer than 16 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('RAM', function () {
                it('Fails when ram is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: '1234'
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" is required]");
                });

                it('Fails when ram is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: '1234',
                            ram: 1
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" must be a string]");
                });

                it('Fails when ram is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: '1234',
                            ram: ''
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" is not allowed to be empty]");
                });

                it('Fails when ram is longer than 16 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: '1234',
                            ram: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('Valid data', function () {
                it('Succeeds with valid data', async function () {
                    const inventoryEntry: {
                        id: number,
                        room: string,
                        number: number,
                        serial: string,
                        model: string,
                        cpu: string,
                        clockSpeed: string,
                        ram: string,
                        updatedAt: string,
                        createdAt: string
                    } = (await agent
                            .post(`/inventory`)
                            .send({
                                room: '1234',
                                number: 1,
                                serial: '1234',
                                model: '1234',
                                cpu: '1234',
                                clockSpeed: '1234',
                                ram: '1234'
                            })
                    ).body;

                    assert.exists(inventoryEntry);

                    assert.exists(inventoryEntry.id);
                    assert.isNumber(inventoryEntry.id);

                    assert.exists(inventoryEntry.room);
                    assert.isString(inventoryEntry.room)

                    assert.exists(inventoryEntry.number);
                    assert.isNumber(inventoryEntry.number);

                    assert.exists(inventoryEntry.serial);
                    assert.isString(inventoryEntry.serial);

                    assert.exists(inventoryEntry.model);
                    assert.isString(inventoryEntry.model);

                    assert.exists(inventoryEntry.cpu);
                    assert.isString(inventoryEntry.cpu);

                    assert.exists(inventoryEntry.clockSpeed);
                    assert.isString(inventoryEntry.clockSpeed);

                    assert.exists(inventoryEntry.ram);
                    assert.isString(inventoryEntry.ram);

                    assert.exists(inventoryEntry.createdAt);
                    assert.isString(inventoryEntry.createdAt);

                    assert.exists(inventoryEntry.updatedAt);
                    assert.isString(inventoryEntry.updatedAt);
                });
            });
        });
    })
};