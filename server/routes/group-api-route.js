'use strict';

import {groupController, memberGroupController} from '../controllers/index';
import {Authentication} from '../middlewares';
module.exports = (app) => {

    // Naming:
    app.route('/groups')
        .get([Authentication.isAuth], groupController.getListActiveGroups)
        .post([Authentication.isAuth], groupController.createGroup);

    app.route('/groups/:id')
        .get([Authentication.isAuth], groupController.getOneGroup)
        .put([Authentication.isAuth], groupController.updateGroup)
        .delete([Authentication.isAuth], groupController.deleteGroup);

};