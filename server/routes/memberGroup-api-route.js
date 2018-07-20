'use strict';

import {memberGroupController} from '../controllers/index';

module.exports = (app) => {

    app.route('/memberGroups')
        .get(memberGroupController.getListMember)
        .post(memberGroupController.createMember);

    app.route('/memberGroups/:id')
        .get(memberGroupController.getOneMember)
        .put(memberGroupController.updateMember)
        .delete(memberGroupController.deleteMember);

};