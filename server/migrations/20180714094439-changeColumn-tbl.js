'use strict';

module.exports = {
    up  : function (queryInterface, Sequelize) {
        return queryInterface
            .changeColumn('Group', 'type', {
                type: Sequelize.ENUM('private', 'group'),

            });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface
            .changeColumn('Group', 'type', {
                type: Sequelize.STRING,

            });
    }
};
