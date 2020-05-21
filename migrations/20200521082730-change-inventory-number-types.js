'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('InventoryEntries', 'clockSpeed', {
            allowNull: false,
            type: Sequelize.INTEGER.UNSIGNED
        });
        await queryInterface.changeColumn('InventoryEntries', 'ram', {
            allowNull: false,
            type: Sequelize.INTEGER.UNSIGNED
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('InventoryEntries', 'clockSpeed', {
            allowNull: false,
            type: Sequelize.STRING(16)
        });
        await queryInterface.changeColumn('InventoryEntries', 'ram', {
            allowNull: false,
            type: Sequelize.STRING(16)
        });
    }
};
