'use strict';
import {JWTHelper} from '../helpers'
export default class Authentication {
    static isAuth = async (req, res, next) => {
        try {
            let token = null;
            let authorization = null;
            if (req.query.token !== undefined) {
                token = req.query.token;
            } else if (req.headers.authorization !== undefined) {
                authorization = req.headers.authorization;
            } else if (req.body.token !== undefined) {
                authorization = req.body.token;
            }
            if (token !== null) {
                req.user = await JWTHelper.verify(token);
                return next();
            }
            if (authorization !== null) {
                const tokens = authorization.split('Bearer ');
                if (tokens.length === 2) {
                    token = tokens[1]
                }
                req.user = await JWTHelper.verify(token);
                return next();
            }
            return res.status(400).json({
               success: true,
               error: "token is required field"
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
}