'use strict';
export default class RoleManagement {
    static verifyRole = async (req, res, next) => {
        try {
            const user = req.user;
            const role = user.role1;
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
}