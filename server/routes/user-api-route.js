'use strict';

import {userController} from '../controllers';
import {Authentication} from '../middlewares';
module.exports = (app) => {
	app.route('/users')
		.get([Authentication.isAuth], userController.getListUsers)
		.post([Authentication.isAuth], userController.createUser);
	app.route('/users/:id')
		.get([Authentication.isAuth], userController.getOneUser)
		.put([Authentication.isAuth], userController.updateUser)
		.delete([Authentication.isAuth], userController.deleteUser);
    app.route('/users/search/:username')
		.get([Authentication.isAuth], userController.getUserByName);
    app.route('/users/:id/changePassword')
		.put([Authentication.isAuth], userController.updatePass);
    app.route('/login')
		.post(userController.login);
    app.route('users/:id/block/:groupId')
		.post([Authentication.isAuth], userController.blockUserInGroup);
};
