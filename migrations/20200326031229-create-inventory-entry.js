'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('InventoryEntries', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER.UNSIGNED
            },
            room: {
                allowNull: false,
                type: Sequelize.STRING(16)
            },
            number: {
                allowNull: false,
                type: Sequelize.INTEGER.UNSIGNED
            },
            serial: {
                allowNull: false,
                type: Sequelize.STRING(16)
            },
            model: {
                allowNull: false,
                type: Sequelize.STRING(64)
            },
            cpu: {
                allowNull: false,
                type: Sequelize.STRING(64)
            },
            clockSpeed: {
                allowNull: false,
                type: Sequelize.STRING(16)
            },
            ram: {
                allowNull: false,
                type: Sequelize.STRING(16)
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
        return queryInterface.dropTable('InventoryEntries');
    }
};