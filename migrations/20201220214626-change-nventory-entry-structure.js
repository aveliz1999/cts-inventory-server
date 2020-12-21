'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('InventoryEntries', 'domain', {
            allowNull: false,
            type: Sequelize.STRING(16)
        });
        await queryInterface.addColumn('InventoryEntries', 'brand', {
            allowNull: false,
            type: Sequelize.STRING(64)
        });
        await queryInterface.addColumn('InventoryEntries', 'windowsVersion', {
            allowNull: false,
            type: Sequelize.STRING(8)
        });
        await queryInterface.addColumn('InventoryEntries', 'windowsBuild', {
            allowNull: false,
            type: Sequelize.STRING(16)
        });
        await queryInterface.addColumn('InventoryEntries', 'windowsRelease', {
            allowNull: false,
            type: Sequelize.STRING(16)
        });
        await queryInterface.addColumn('InventoryEntries', 'cpuCores', {
            allowNull: false,
            type: Sequelize.INTEGER.UNSIGNED
        });
        await queryInterface.addColumn('InventoryEntries', 'disk', {
            allowNull: false,
            type: Sequelize.FLOAT.UNSIGNED
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('InventoryEntries', 'domain');
        await queryInterface.removeColumn('InventoryEntries', 'brand');
        await queryInterface.removeColumn('InventoryEntries', 'windowsVersion');
        await queryInterface.removeColumn('InventoryEntries', 'windowsBuild');
        await queryInterface.removeColumn('InventoryEntries', 'windowsRelease');
        await queryInterface.removeColumn('InventoryEntries', 'cpuCores');
        await queryInterface.removeColumn('InventoryEntries', 'disk');
    }
};
