'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      return queryInterface
          .addColumn('User', 'role1', Sequelize.ENUM('normal', 'admin'));
  },

  down: (queryInterface, Sequelize) => {
      queryInterface.removeColumn(
          'User',
          'role',
          );
  }
};
