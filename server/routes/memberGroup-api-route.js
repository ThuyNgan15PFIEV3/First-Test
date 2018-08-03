'use strict';
import {memberGroupController} from '../controllers/index';
import {Authentication} from '../middlewares';
module.exports = (app) => {

    app.route('/memberGroups')
        .get(memberGroupController.getListMember)
        .post([Authentication.isAuth], memberGroupController.createMember)

    app.route('/memberGroups/:id')
        .get(memberGroupController.getOneMember)
        .put(memberGroupController.updateMember)
        .delete(memberGroupController.deleteMember);

    app.route('/members/groups/:id/leave')
        .delete([Authentication.isAuth], memberGroupController.leaveGroup);
    app.route('/members/groups/:id/invite')
        .post([Authentication.isAuth], memberGroupController.inviteToGroup)
};