import {before, describe} from "mocha";
import {assert} from "chai";
import faker from "faker";
import User from "../../models/User";
import InventoryEntry from "../../models/InventoryEntry";

export default function (chai, app) {
    describe('Search inventory', function () {
        it('Fails when not authenticated', async function () {
            const {message}: { message: string } = (await chai.request(app).post('/inventory/search')).body;
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

            it('Fails when not provided any data', async function () {
                const {message}: { message: string } = (await agent.post('/inventory/search').send({})).body;
                assert.equal(message, "Must provide one or more of the following: [room, number, serial, model, cpu, clockSpeed, ram, after]");
            });

            describe('After', function () {
                it('Fails when after is not a number', async function () {
                    const {message}: { message: string } = (await agent.post('/inventory/search').send({after: 'a'})).body;
                    assert.equal(message, "child \"after\" fails because [\"after\" must be a number]");
                });

                it('Fails when after is not an integer', async function () {
                    const {message}: { message: string } = (await agent.post('/inventory/search').send({after: 1.1})).body;
                    assert.equal(message, "child \"after\" fails because [\"after\" must be an integer]");
                });

                it('Fails when after is not positive', async function () {
                    const {message}: { message: string } = (await agent.post('/inventory/search').send({after: 0})).body;
                    assert.equal(message, "child \"after\" fails because [\"after\" must be a positive number]");
                });
            });

            describe('Search', function () {
                it('Fails when search is not an object', async function () {
                    const {message}: { message: string } = (await agent.post('/inventory/search').send({search: 'a'})).body;
                    assert.equal(message, "child \"search\" fails because [\"search\" must be an object]");
                });

                describe('Room', function () {
                    describe('Value', function () {
                        it('Fails when room is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        room: {
                                            value: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"room\" fails because [child \"value\" fails because [\"value\" must be a string]]]");
                        });

                        it('Fails when room is empty', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        room: {
                                            value: ''
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"room\" fails because [child \"value\" fails because [\"value\" is not allowed to be empty]]]");
                        });

                        it('Fails when room is longer than 16 characters', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        room: {
                                            value: ''.padEnd(17, '0')
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"room\" fails because [child \"value\" fails because [\"value\" length must be less than or equal to 16 characters long]]]");
                        });
                    });

                    describe('Operator', function () {
                        it('Fails when operator is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        room: {
                                            value: '1234',
                                            operator: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"room\" fails because [child \"operator\" fails because [\"operator\" must be a string]]]");
                        });

                        it('Fails when operator is not an allowed type', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        room: {
                                            value: '1234',
                                            operator: "a"
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"room\" fails because [child \"operator\" fails because [\"operator\" must be one of [=, >, >=, <, <=]]]]");
                        });
                    });
                });

                describe('Number', function () {
                    describe('Value', function () {
                        it('Fails when number is not a number', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        number: {
                                            value: ''
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"number\" fails because [child \"value\" fails because [\"value\" must be a number]]]");
                        });

                        it('Fails when number is not positive', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        number: {
                                            value: 0
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"number\" fails because [child \"value\" fails because [\"value\" must be a positive number]]]");
                        });

                        it('Fails when number is not an integer', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        number: {
                                            value: 1.5
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"number\" fails because [child \"value\" fails because [\"value\" must be an integer]]]");
                        });
                    });

                    describe('Operator', function () {
                        it('Fails when operator is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        number: {
                                            value: 1,
                                            operator: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"number\" fails because [child \"operator\" fails because [\"operator\" must be a string]]]");
                        });

                        it('Fails when operator is not an allowed type', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        number: {
                                            value: 1,
                                            operator: "a"
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"number\" fails because [child \"operator\" fails because [\"operator\" must be one of [=, >, >=, <, <=]]]]");
                        });
                    });
                });

                describe('Serial', function () {
                    describe('Value', function () {
                        it('Fails when serial is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        serial: {
                                            value: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"serial\" fails because [child \"value\" fails because [\"value\" must be a string]]]");
                        });

                        it('Fails when serial is empty', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        serial: {
                                            value: ''
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"serial\" fails because [child \"value\" fails because [\"value\" is not allowed to be empty]]]");
                        });

                        it('Fails when serial is longer than 16 characters', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        serial: {
                                            value: ''.padEnd(17, '0')
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"serial\" fails because [child \"value\" fails because [\"value\" length must be less than or equal to 16 characters long]]]");
                        });
                    });

                    describe('Operator', function () {
                        it('Fails when operator is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        serial: {
                                            value: '1234',
                                            operator: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"serial\" fails because [child \"operator\" fails because [\"operator\" must be a string]]]");
                        });

                        it('Fails when operator is not an allowed type', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        serial: {
                                            value: '1234',
                                            operator: "a"
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"serial\" fails because [child \"operator\" fails because [\"operator\" must be one of [=, >, >=, <, <=]]]]");
                        });
                    });
                });

                describe('Model', function () {
                    describe('Value', function () {
                        it('Fails when model is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        model: {
                                            value: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"model\" fails because [child \"value\" fails because [\"value\" must be a string]]]");
                        });

                        it('Fails when model is empty', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        model: {
                                            value: ''
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"model\" fails because [child \"value\" fails because [\"value\" is not allowed to be empty]]]");
                        });

                        it('Fails when model is longer than 64 characters', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        model: {
                                            value: ''.padEnd(65, '0')
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"model\" fails because [child \"value\" fails because [\"value\" length must be less than or equal to 64 characters long]]]");
                        });
                    });

                    describe('Operator', function () {
                        it('Fails when operator is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        model: {
                                            value: '1234',
                                            operator: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"model\" fails because [child \"operator\" fails because [\"operator\" must be a string]]]");
                        });

                        it('Fails when operator is not an allowed type', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        model: {
                                            value: '1234',
                                            operator: "a"
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"model\" fails because [child \"operator\" fails because [\"operator\" must be one of [=, >, >=, <, <=]]]]");
                        });
                    });
                });

                describe('CPU', function () {
                    describe('Value', function () {
                        it('Fails when cpu is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        cpu: {
                                            value: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"cpu\" fails because [child \"value\" fails because [\"value\" must be a string]]]");
                        });

                        it('Fails when cpu is empty', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        cpu: {
                                            value: ''
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"cpu\" fails because [child \"value\" fails because [\"value\" is not allowed to be empty]]]");
                        });

                        it('Fails when cpu is longer than 64 characters', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        cpu: {
                                            value: ''.padEnd(65, '0')
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"cpu\" fails because [child \"value\" fails because [\"value\" length must be less than or equal to 64 characters long]]]");
                        });
                    });

                    describe('Operator', function () {
                        it('Fails when operator is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        cpu: {
                                            value: '1234',
                                            operator: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"cpu\" fails because [child \"operator\" fails because [\"operator\" must be a string]]]");
                        });

                        it('Fails when operator is not an allowed type', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        cpu: {
                                            value: '1234',
                                            operator: "a"
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"cpu\" fails because [child \"operator\" fails because [\"operator\" must be one of [=, >, >=, <, <=]]]]");
                        });
                    });
                });

                describe('Clock Speed', function () {
                    describe('Value', function () {
                        it('Fails when clockSpeed is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        clockSpeed: {
                                            value: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"clockSpeed\" fails because [child \"value\" fails because [\"value\" must be a string]]]");
                        });

                        it('Fails when clockSpeed is empty', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        clockSpeed: {
                                            value: ''
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"clockSpeed\" fails because [child \"value\" fails because [\"value\" is not allowed to be empty]]]");
                        });

                        it('Fails when clockSpeed is longer than 16 characters', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        clockSpeed: {
                                            value: ''.padEnd(17, '0')
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"clockSpeed\" fails because [child \"value\" fails because [\"value\" length must be less than or equal to 16 characters long]]]");
                        });
                    });

                    describe('Operator', function () {
                        it('Fails when operator is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        clockSpeed: {
                                            value: '1234',
                                            operator: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"clockSpeed\" fails because [child \"operator\" fails because [\"operator\" must be a string]]]");
                        });

                        it('Fails when operator is not an allowed type', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        clockSpeed: {
                                            value: '1234',
                                            operator: "a"
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"clockSpeed\" fails because [child \"operator\" fails because [\"operator\" must be one of [=, >, >=, <, <=]]]]");
                        });
                    });
                });

                describe('RAM', function () {
                    describe('Value', function () {
                        it('Fails when ram is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        ram: {
                                            value: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"ram\" fails because [child \"value\" fails because [\"value\" must be a string]]]");
                        });

                        it('Fails when ram is empty', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        ram: {
                                            value: ""
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"ram\" fails because [child \"value\" fails because [\"value\" is not allowed to be empty]]]");
                        });

                        it('Fails when ram is longer than 16 characters', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        ram: {
                                            value: ''.padEnd(17, '0')
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"ram\" fails because [child \"value\" fails because [\"value\" length must be less than or equal to 16 characters long]]]");
                        });
                    });

                    describe('Operator', function () {
                        it('Fails when operator is not a string', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        clockSpeed: {
                                            value: '1234',
                                            operator: 1
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"clockSpeed\" fails because [child \"operator\" fails because [\"operator\" must be a string]]]");
                        });

                        it('Fails when operator is not an allowed type', async function () {
                            const {message}: { message: string } = (await agent
                                .post('/inventory/search')
                                .send({
                                    search: {
                                        clockSpeed: {
                                            value: '1234',
                                            operator: "a"
                                        }
                                    }
                                })).body;
                            assert.equal(message, "child \"search\" fails because [child \"clockSpeed\" fails because [child \"operator\" fails because [\"operator\" must be one of [=, >, >=, <, <=]]]]");
                        });
                    });
                });
            });

            describe('Valid Data', function () {
                let entries;

                before('Create Test Data', async function () {
                    entries = await InventoryEntry.bulkCreate(
                        [...Array(10).keys()].map(number => {
                            return {
                                room: `${number}`,
                                number,
                                serial: `${number}`,
                                model: `${number}`,
                                cpu: `${number}`,
                                clockSpeed: `${number}`,
                                ram: `${number}`
                            }
                        })
                    );
                });

                it('Correct data returned when providing after', async function () {
                    const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                        after: entries[0].id - 1
                    })).body;
                    assert.equal(returnedEntries.length, 10);
                    returnedEntries.forEach((entry: InventoryEntry, index: number) => {
                        for (let property of Object.entries(entries[index].dataValues)) {
                            if (property[1] instanceof Date) {
                                assert.equal(entry[property[0]], property[1].toISOString());
                            } else {
                                assert.equal(entry[property[0]], property[1]);
                            }
                        }
                    });
                });

                describe('Room', function () {
                    it('= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    room: {
                                        value: entries[index].room,
                                        operator: '='
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });

                    it('> filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    room: {
                                        value: entries[index].room,
                                        operator: '>'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i + 1].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('>= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    room: {
                                        value: entries[index].room,
                                        operator: '>='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('< filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    room: {
                                        value: entries[index].room,
                                        operator: '<'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('<= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    room: {
                                        value: entries[index].room,
                                        operator: '<='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('Non-specified filter defaults to =', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    room: {
                                        value: entries[index].room
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });
                });

                describe('Number', function () {
                    it('= filter works', async function () {
                        for (let index = 1; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    number: {
                                        value: entries[index].number,
                                        operator: '='
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });

                    it('> filter works', async function () {
                        for (let index = 1; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    number: {
                                        value: entries[index].number,
                                        operator: '>'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i + 1].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('>= filter works', async function () {
                        for (let index = 1; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    number: {
                                        value: entries[index].number,
                                        operator: '>='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('< filter works', async function () {
                        for (let index = 1; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    number: {
                                        value: entries[index].number,
                                        operator: '<'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('<= filter works', async function () {
                        for (let index = 1; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    number: {
                                        value: entries[index].number,
                                        operator: '<='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('Non-specified filter defaults to =', async function () {
                        for (let index = 1; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    number: {
                                        value: entries[index].number
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });
                });

                describe('Serial', function () {
                    it('= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    serial: {
                                        value: entries[index].serial,
                                        operator: '='
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });

                    it('> filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    serial: {
                                        value: entries[index].serial,
                                        operator: '>'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i + 1].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('>= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    serial: {
                                        value: entries[index].serial,
                                        operator: '>='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('< filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    serial: {
                                        value: entries[index].serial,
                                        operator: '<'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('<= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    serial: {
                                        value: entries[index].serial,
                                        operator: '<='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('Non-specified filter defaults to =', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    serial: {
                                        value: entries[index].serial
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });
                });

                describe('Model', function () {
                    it('= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    model: {
                                        value: entries[index].model,
                                        operator: '='
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });

                    it('> filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    model: {
                                        value: entries[index].model,
                                        operator: '>'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i + 1].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('>= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    model: {
                                        value: entries[index].model,
                                        operator: '>='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('< filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    model: {
                                        value: entries[index].model,
                                        operator: '<'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('<= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    model: {
                                        value: entries[index].model,
                                        operator: '<='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('Non-specified filter defaults to =', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    model: {
                                        value: entries[index].model
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });
                });

                describe('CPU', function () {
                    it('= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    cpu: {
                                        value: entries[index].cpu,
                                        operator: '='
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });

                    it('> filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    cpu: {
                                        value: entries[index].cpu,
                                        operator: '>'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i + 1].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('>= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    cpu: {
                                        value: entries[index].cpu,
                                        operator: '>='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('< filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    cpu: {
                                        value: entries[index].cpu,
                                        operator: '<'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('<= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    cpu: {
                                        value: entries[index].cpu,
                                        operator: '<='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('Non-specified filter defaults to =', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    cpu: {
                                        value: entries[index].cpu
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });
                });

                describe('Clock Speed', function () {
                    it('= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    clockSpeed: {
                                        value: entries[index].clockSpeed,
                                        operator: '='
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });

                    it('> filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    clockSpeed: {
                                        value: entries[index].clockSpeed,
                                        operator: '>'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i + 1].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('>= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    clockSpeed: {
                                        value: entries[index].clockSpeed,
                                        operator: '>='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('< filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    clockSpeed: {
                                        value: entries[index].clockSpeed,
                                        operator: '<'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('<= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    clockSpeed: {
                                        value: entries[index].clockSpeed,
                                        operator: '<='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('Non-specified filter defaults to =', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    clockSpeed: {
                                        value: entries[index].clockSpeed
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });
                });

                describe('RAM', function () {
                    it('= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    ram: {
                                        value: entries[index].ram,
                                        operator: '='
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });

                    it('> filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    ram: {
                                        value: entries[index].ram,
                                        operator: '>'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i + 1].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('>= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    ram: {
                                        value: entries[index].ram,
                                        operator: '>='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[index + i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('< filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    ram: {
                                        value: entries[index].ram,
                                        operator: '<'
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('<= filter works', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    ram: {
                                        value: entries[index].ram,
                                        operator: '<='
                                    }
                                }
                            })).body;
                            for (let i = 0; i < returnedEntries.length; i++) {
                                const entry = returnedEntries[i];
                                for (let property of Object.entries(entries[i].dataValues)) {
                                    if (property[1] instanceof Date) {
                                        assert.equal(entry[property[0]], property[1].toISOString());
                                    } else {
                                        assert.equal(entry[property[0]], property[1]);
                                    }
                                }
                            }
                        }
                    });

                    it('Non-specified filter defaults to =', async function () {
                        for (let index = 0; index < entries.length; index++) {
                            const returnedEntries: InventoryEntry[] = (await agent.post('/inventory/search').send({
                                after: entries[0].id - 1,
                                search: {
                                    ram: {
                                        value: entries[index].ram
                                    }
                                }
                            })).body;
                            const entry = returnedEntries[0];

                            for (let property of Object.entries(entries[index].dataValues)) {
                                if (property[1] instanceof Date) {
                                    assert.equal(entry[property[0]], property[1].toISOString());
                                } else {
                                    assert.equal(entry[property[0]], property[1]);
                                }
                            }
                        }
                    });
                });
            });
        });
    });
};