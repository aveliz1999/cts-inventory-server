'use strict';

const bcrypt = require('bcrypt');
const env = process.env.NODE_ENV || 'development';
const saltRounds = require('../config/passwords.json')[env].saltRounds

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Users', [
            {
                id: 1,
                username: 'administrator',
                name: 'Administrator',
                password: await bcrypt.hash('password', saltRounds),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ])
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', {
            where: {
                id: 1
            }
        }, {});
    }
};
