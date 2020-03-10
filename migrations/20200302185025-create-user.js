'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER.UNSIGNED
            },
            username: {
                unique: true,
                allowNull: false,
                type: Sequelize.STRING(16)
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING(32)
            },
            password: {
                allowNull: false,
                type: Sequelize.CHAR(60)
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE(3)
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE(3)
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Users');
    }
};