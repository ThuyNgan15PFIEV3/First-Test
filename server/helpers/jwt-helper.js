'use strict';
import JWT from 'jsonwebtoken';
import {privateKey, publicKey} from '../config/index';
export default class JWTHelper {
    static async sign (data) {
        return new Promise((resolve, reject) => {
            JWT.sign(data, privateKey, {
                expiresIn: 60 * 60,
                algorithm: 'RS256'
            }, (error, token) => {
                if (error) {
                    return reject(error);
                }
                return resolve(token);
            });
        });
    }
    static async verify (token) {
        return new Promise((resolve, reject) => {
            JWT.verify(token, publicKey, {
                algorithm: 'RS256'
            }, (error, data) => {
                if (error) {
                    return reject(error);
                }
                return resolve(data);
            });
        });
    }
}