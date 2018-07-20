'use strict';
import {JWTHelper} from '../helpers'
export default class RoleManagement {
    static isAdmin = async (req, res, next) => {
        try {
            let role = null;
            if (role === 'normal') {
                return res.status(400).json({
                    success: true,
                    error: "You are not admin"
                });
            }
            return next();
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }

}