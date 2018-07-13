'use strict';

import {userController} from '../controllers/index';

module.exports = (app) => {
	app.route('/users')
		.get(userController.getListUsers)
		.post(userController.createUser);

	app.route('/users/:id')
		.get(userController.getOneUser)
		.put(userController.updateUser)
		.delete(userController.deleteUser);
    app.route('/users/search/:username')
		.get(userController.getUserByName);
    app.route('/users/:id/changePassword')
		.put(userController.updatePass);
};
