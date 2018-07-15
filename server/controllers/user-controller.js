'use strict';
import {User, Block} from '../models';
import {Op} from '../models';
import {encryptHelper} from '../helpers/index';
let bcrypt = require('bcrypt');
export default class UserController {
    login = async (req, res, next) => {
        try {
            const {username, password} = req.body;
            if (username === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is required field'
                });
            }
            if (password === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Password is required field'
                });
            }
            const user = await User.find({
                where: {
                    username
                }
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is not exist'
                });
            }
            const isValidPass = await encryptHelper.isValidPassword(password, user.password);
            if (!isValidPass) {
                return res.status(400).json({
                    success: false,
                    error: 'The password is invalid'
                });
            }
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            })
        }
    };
    getListUsers = async (req, res, next) => {
        try {
            const users = await User.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [
                    {
                        model: Block,
                        as: 'block',
                        required: false
                    }
                ]
            });
            return res.status(200).json({
                success: true,
                data: users
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            })
        }

    };
    createUser = async (req, res, next) => {
        try {
            const {username, password, address} = req.body;
            if (!Array.isArray(address) || address.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Address is invalid'
                });
            }
            let hashPass = await encryptHelper.hashPass(password);
            const newUser = await User.create({
                username,
                password: hashPass,
                address
            });
            return res.status(200).json({
                success: true,
                data: newUser
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            })
        }
    };
    getOneUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'User is not exist'
                });
            }
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    getUserByName = async (req, res, next) => {
        try {
            const {username} = req.params;
            const user = await User.findOne({
                where: {
                    username: {
                        [Op.iLike]: `%${username}%`
                    }
                },
                returning: true
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'User is not exist'
                });
            }
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    deleteUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            await User.destroy({
                where: {
                    id
                }
            });
            return res.status(200).json({
                success: true,
                data: true
            })
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    updateUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {username, address} = req.body;
            const updatedUser = await User.update(
                {
                    username,
                    address
                },
                {
                    where: {
                        id
                    },
                    returning: true
                }
            );
            if (updatedUser[0] === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot update user'
                });
            }
            return res.status(200).json({
                success: true,
                data: updatedUser[1]
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    updatePass = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {oldPassword, newPassword} = req.body;
            const user = await User.findById(id);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'Not found user'
                });
            }
            const isValidPass = await encryptHelper.isValidPassword(oldPassword, user.password);
            if (!isValidPass) {
                return res.status(400).json({
                    success: false,
                    error: 'The old password is invalid'
                });
            }
            const newHashPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(newPassword, bcrypt.genSaltSync(8), function (error, hash) {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(hash);
                });
            });
            const updatedPass = await User.update(
                {
                    password: newHashPassword
                },
                {
                    where: {
                        id
                    },
                    returning: true
                }
            );
            if (updatedPass[0] === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot update user'
                });
            }
            return res.status(200).json({
                success: true,
                data: updatedPass[1]
            });

        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
}