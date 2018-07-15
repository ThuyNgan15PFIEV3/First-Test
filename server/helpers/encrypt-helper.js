'use strict';
let bcrypt = require('bcrypt');

export default class EncryptHelper {
    hashPass = (password) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, bcrypt.genSaltSync(8), function (error, hash) {
                if (error) {
                    return reject(error);
                }
                return resolve(hash);
            });
        });
    };
    isValidPassword = function (password, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    if (res === true) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                }
            });
        })
    };
}