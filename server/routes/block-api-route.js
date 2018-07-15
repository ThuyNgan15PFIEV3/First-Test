'use strict';

import {blockController} from '../controllers/index';

module.exports = (app) => {

    // Naming:
    app.route('/blocks')
        .get(blockController.getListBlock)
        .post(blockController.createBlock);

    app.route('/blocks/:id')
        .get(blockController.getOneBlock)
        .put(blockController.updateBlock)
        .delete(blockController.deleteBlock);
};