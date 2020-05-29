import {before, describe} from "mocha";
import {assert} from "chai";
import faker from "faker";
import User from "../../models/User";

export default function (chai, app) {
    describe('Get entry from ID', function () {
        it('Fails when not authenticated', async function () {
            const {message}: { message: string } = (await chai.request(app).get('/inventory/1')).body;
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
                    })
                const returnedUser: User = (await agent
                    .post('/users/login')
                    .send({username, password})).body;
                assert.equal(returnedUser.username, username);
            });

            describe('ID', function () {
                it('Fails when ID is not a number', async function () {
                    const {message}: { message: string } = (await agent.get('/inventory/a')).body;
                    assert.equal(message, "child \"id\" fails because [\"id\" must be a number]");
                });
                it('Fails when ID is not positive', async function () {
                    const {message}: { message: string } = (await agent.get('/inventory/0')).body;
                    assert.equal(message, "child \"id\" fails because [\"id\" must be a positive number]");
                });
                it('Fails when ID is not an integer', async function () {
                    const {message}: { message: string } = (await agent.get('/inventory/1.1')).body;
                    assert.equal(message, "child \"id\" fails because [\"id\" must be an integer]");
                });
            });
            describe('Valid data', function () {
                let entryId;
                before('Add entry to search', async function () {
                    const {id}: { id: number } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1234,
                            serial: '1234',
                            model: '1234',
                            cpu: '1234',
                            clockSpeed: 1234,
                            ram: 1234,
                        })).body;
                    entryId = id;
                });

                it('Succeeds with valid data', async function () {
                    const inventoryEntry: {
                        id: number,
                        room: string,
                        number: number,
                        serial: string,
                        model: string,
                        cpu: string,
                        clockSpeed: number,
                        ram: number,
                        updatedAt: string,
                        createdAt: string
                    } = (await agent.get(`/inventory/${entryId}`)).body;

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
                    assert.isNumber(inventoryEntry.clockSpeed);

                    assert.exists(inventoryEntry.ram);
                    assert.isNumber(inventoryEntry.ram);

                    assert.exists(inventoryEntry.createdAt);
                    assert.isString(inventoryEntry.createdAt);

                    assert.exists(inventoryEntry.updatedAt);
                    assert.isString(inventoryEntry.updatedAt);
                });
            })
        })
    });
};