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

            describe('Domain', function () {
                it('Fails when domain is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1
                        })).body;
                    assert.equal(message, "child \"domain\" fails because [\"domain\" is required]");
                });

                it('Fails when domain is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: false
                        })).body;
                    assert.equal(message, "child \"domain\" fails because [\"domain\" must be a string]");
                });

                it('Fails when domain is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: ''
                        })).body;
                    assert.equal(message, "child \"domain\" fails because [\"domain\" is not allowed to be empty]");
                });

                it('Fails when domain is longer than 16 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"domain\" fails because [\"domain\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('Brand', function () {
                it('Fails when brand is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234'
                        })).body;
                    assert.equal(message, "child \"brand\" fails because [\"brand\" is required]");
                });

                it('Fails when brand is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: 1
                        })).body;
                    assert.equal(message, "child \"brand\" fails because [\"brand\" must be a string]");
                });

                it('Fails when brand is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: ''
                        })).body;
                    assert.equal(message, "child \"brand\" fails because [\"brand\" is not allowed to be empty]");
                });

                it('Fails when brand is longer than 64 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: ''.padEnd(65, '0')
                        })).body;
                    assert.equal(message, "child \"brand\" fails because [\"brand\" length must be less than or equal to 64 characters long]");
                });
            });

            describe('Model', function () {
                it('Fails when model is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234'
                        })).body;
                    assert.equal(message, "child \"model\" fails because [\"model\" is required]");
                });

                it('Fails when model is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
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
                            domain: '1234',
                            brand: '1234',
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
                            domain: '1234',
                            brand: '1234',
                            model: ''.padEnd(65, '0')
                        })).body;
                    assert.equal(message, "child \"model\" fails because [\"model\" length must be less than or equal to 64 characters long]");
                });
            });

            describe('Serial', function () {
                it('Fails when serial is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234'
                        })).body;
                    assert.equal(message, "child \"serial\" fails because [\"serial\" is required]");
                });

                it('Fails when serial is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
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
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
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
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"serial\" fails because [\"serial\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('Windows Version', function () {
                it('Fails when windowsVersion is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234'
                        })).body;
                    assert.equal(message, "child \"windowsVersion\" fails because [\"windowsVersion\" is required]");
                });

                it('Fails when windowsVersion is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: 1
                        })).body;
                    assert.equal(message, "child \"windowsVersion\" fails because [\"windowsVersion\" must be a string]");
                });

                it('Fails when windowsVersion is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: ''
                        })).body;
                    assert.equal(message, "child \"windowsVersion\" fails because [\"windowsVersion\" is not allowed to be empty]");
                });

                it('Fails when windowsVersion is longer than 8 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: ''.padEnd(9, '0')
                        })).body;
                    assert.equal(message, "child \"windowsVersion\" fails because [\"windowsVersion\" length must be less than or equal to 8 characters long]");
                });
            });

            describe('Windows Build', function () {
                it('Fails when windowsBuild is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234'
                        })).body;
                    assert.equal(message, "child \"windowsBuild\" fails because [\"windowsBuild\" is required]");
                });

                it('Fails when windowsBuild is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: 1
                        })).body;
                    assert.equal(message, "child \"windowsBuild\" fails because [\"windowsBuild\" must be a string]");
                });

                it('Fails when windowsBuild is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: ''
                        })).body;
                    assert.equal(message, "child \"windowsBuild\" fails because [\"windowsBuild\" is not allowed to be empty]");
                });

                it('Fails when windowsBuild is longer than 16 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"windowsBuild\" fails because [\"windowsBuild\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('Windows Release', function () {
                it('Fails when windowsRelease is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234'
                        })).body;
                    assert.equal(message, "child \"windowsRelease\" fails because [\"windowsRelease\" is required]");
                });

                it('Fails when windowsRelease is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: 1
                        })).body;
                    assert.equal(message, "child \"windowsRelease\" fails because [\"windowsRelease\" must be a string]");
                });

                it('Fails when windowsRelease is empty', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: ''
                        })).body;
                    assert.equal(message, "child \"windowsRelease\" fails because [\"windowsRelease\" is not allowed to be empty]");
                });

                it('Fails when windowsRelease is longer than 16 characters', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: ''.padEnd(17, '0')
                        })).body;
                    assert.equal(message, "child \"windowsRelease\" fails because [\"windowsRelease\" length must be less than or equal to 16 characters long]");
                });
            });

            describe('CPU', function () {
                it('Fails when cpu is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234'
                        })).body;
                    assert.equal(message, "child \"cpu\" fails because [\"cpu\" is required]");
                });

                it('Fails when cpu is not a string', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
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
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
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
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
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
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234'
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" is required]");
                });

                it('Fails when clockSpeed is not a number', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: false
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" must be a number]");
                });

                it('Fails when clockSpeed is not positive', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 0
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" must be a positive number]");
                });

                it('Fails when clockSpeed is not an integer', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1.5
                        })).body;
                    assert.equal(message, "child \"clockSpeed\" fails because [\"clockSpeed\" must be an integer]");
                });
            });

            describe('CPU Cores', function () {
                it('Fails when cpuCores is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1
                        })).body;
                    assert.equal(message, "child \"cpuCores\" fails because [\"cpuCores\" is required]");
                });

                it('Fails when cpuCores is not a number', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: false
                        })).body;
                    assert.equal(message, "child \"cpuCores\" fails because [\"cpuCores\" must be a number]");
                });

                it('Fails when cpuCores is not positive', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 0
                        })).body;
                    assert.equal(message, "child \"cpuCores\" fails because [\"cpuCores\" must be a positive number]");
                });

                it('Fails when cpuCores is not an integer', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1.5
                        })).body;
                    assert.equal(message, "child \"cpuCores\" fails because [\"cpuCores\" must be an integer]");
                });
            });

            describe('RAM', function () {
                it('Fails when ram is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" is required]");
                });

                it('Fails when ram is not a number', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1,
                            ram: false
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" must be a number]");
                });

                it('Fails when ram is not positive', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1,
                            ram: 0
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" must be a positive number]");
                });

                it('Fails when ram is not an integer', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1,
                            ram: 1.5
                        })).body;
                    assert.equal(message, "child \"ram\" fails because [\"ram\" must be an integer]");
                });
            });

            describe('Disk', function () {
                it('Fails when disk is not present', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1,
                            ram: 1
                        })).body;
                    assert.equal(message, "child \"disk\" fails because [\"disk\" is required]");
                });

                it('Fails when disk is not a number', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1,
                            ram: 1,
                            disk: false
                        })).body;
                    assert.equal(message, "child \"disk\" fails because [\"disk\" must be a number]");
                });

                it('Fails when disk is not positive', async function () {
                    const {message}: { message: string } = (await agent
                        .post('/inventory')
                        .send({
                            room: '1234',
                            number: 1,
                            domain: '1234',
                            brand: '1234',
                            model: '1234',
                            serial: '1234',
                            windowsVersion: '1234',
                            windowsBuild: '1234',
                            windowsRelease: '1234',
                            cpu: '1234',
                            clockSpeed: 1,
                            cpuCores: 1,
                            ram: 1,
                            disk: 0
                        })).body;
                    assert.equal(message, "child \"disk\" fails because [\"disk\" must be a positive number]");
                });
            });

            describe('Valid data', function () {
                it('Succeeds with valid data', async function () {
                    const inventoryEntry: {
                        id: number,
                        room: string,
                        number: number,
                        domain: string,
                        brand: string,
                        model: string,
                        serial: string,
                        windowsVersion: string,
                        windowsBuild: string,
                        windowsRelease: string,
                        cpu: string,
                        clockSpeed: number,
                        cpuCores: number,
                        ram: number,
                        disk: number
                        updatedAt: string,
                        createdAt: string
                    } = (await agent
                            .post(`/inventory`)
                            .send({
                                room: '1234',
                                number: 1,
                                domain: '1234',
                                brand: '1234',
                                model: '1234',
                                serial: '1234',
                                windowsVersion: '1234',
                                windowsBuild: '1234',
                                windowsRelease: '1234',
                                cpu: '1234',
                                clockSpeed: 1,
                                cpuCores: 1,
                                ram: 1,
                                disk: 1
                            })
                    ).body;

                    assert.exists(inventoryEntry);

                    assert.exists(inventoryEntry.id);
                    assert.isNumber(inventoryEntry.id);

                    assert.exists(inventoryEntry.room);
                    assert.isString(inventoryEntry.room)

                    assert.exists(inventoryEntry.number);
                    assert.isNumber(inventoryEntry.number);

                    assert.exists(inventoryEntry.domain);
                    assert.isString(inventoryEntry.domain);

                    assert.exists(inventoryEntry.brand);
                    assert.isString(inventoryEntry.brand);

                    assert.exists(inventoryEntry.model);
                    assert.isString(inventoryEntry.model);

                    assert.exists(inventoryEntry.serial);
                    assert.isString(inventoryEntry.serial);

                    assert.exists(inventoryEntry.windowsVersion);
                    assert.isString(inventoryEntry.windowsVersion);

                    assert.exists(inventoryEntry.windowsBuild);
                    assert.isString(inventoryEntry.windowsBuild);

                    assert.exists(inventoryEntry.windowsRelease);
                    assert.isString(inventoryEntry.windowsRelease);

                    assert.exists(inventoryEntry.cpu);
                    assert.isString(inventoryEntry.cpu);

                    assert.exists(inventoryEntry.clockSpeed);
                    assert.isNumber(inventoryEntry.clockSpeed);

                    assert.exists(inventoryEntry.cpuCores);
                    assert.isNumber(inventoryEntry.cpuCores);

                    assert.exists(inventoryEntry.ram);
                    assert.isNumber(inventoryEntry.ram);

                    assert.exists(inventoryEntry.disk);
                    assert.isNumber(inventoryEntry.disk);

                    assert.exists(inventoryEntry.createdAt);
                    assert.isString(inventoryEntry.createdAt);

                    assert.exists(inventoryEntry.updatedAt);
                    assert.isString(inventoryEntry.updatedAt);
                });
            });
        });
    })
};