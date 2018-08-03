'use strict';
import {User, Block, Group, MemberGroup} from '../models';
import {Op} from '../models';
import {encryptHelper,  JWTHelper, responseHelper} from '../helpers/index';
let bcrypt = require('bcrypt');
export default class UserController {
    login = async (req, res, next) => {
        try {
            const {username, password} = req.body;
            if (username === undefined) {
                return responseHelper.returnError(res, new Error('Username is required field'));
            }
            if (password === undefined) {
                return responseHelper.returnError(res, new Error('Password is required field'));
            }
            const user = await User.find({
                where: {
                    username
                },
                attribute: ['username', 'password', 'id']
            });
            if (!user) {
                return responseHelper.returnError(res, new Error('User is not exist'));
            }
            const isValidPass = await encryptHelper.isValidPassword(password, user.password);
            if (!isValidPass) {
                return responseHelper.returnError(res, new Error('Wrong password'));
            }
            const token = await JWTHelper.sign({
                id: user.id,
                username: user.username,
                role: user.role1
            });
            console.log(token);
            return responseHelper.returnSuccess(res, {
                token
            });
        } catch (e) {
            console.log(e);
            return responseHelper.returnError(res, e);
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
            return responseHelper.returnSuccess(res, {
                users
            });
        } catch (e) {
            return responseHelper.returnError(res, e);
        }
    };

    createUser = async (req, res, next) => {
        try {
            const {username, password, address} = req.body;
            if (!Array.isArray(address) || address.length === 0) {
                return responseHelper.returnError(res, new Error('Address is invalid'));
            }
            let hashPass = await encryptHelper.hashPass(password);
            const newUser = await User.create({
                username,
                password: hashPass,
                address
            });
            return responseHelper.returnSuccess(res, {
                newUser
            });
        } catch (e) {
            return responseHelper.returnError(res, e);
        }
    };

    getOneUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            const user = await User.findById(id);
            if (!user) {
                return responseHelper.returnError(res, new Error('User is not exist'));
            }
            return responseHelper.returnSuccess(res, user);
        } catch (e) {
            return responseHelper.returnError(res, e);
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
            const role = req.user.role1;
            if (role !== "admin") {
                return res.status(400).json({
                    success: false,
                    error: "Delete wrong! You are not admin"
                });
            }
            else {
                await User.destroy({
                    where: {
                        id
                    }
                });
                return res.status(200).json({
                    success: true,
                    data: true
                });
            }
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
            const author = req.user.id;
            if (author !== null) {
                return res.status(400).json({
                    success: false,
                    error: "You are not author"
                });
            }
            else {
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
            }
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    updateActiveUser = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {username, address} = req.body;
            const role = req.user.role1;
            if (role !== "admin") {
                return res.status(400).json({
                    success: false,
                    error: "Update wrong! You are not admin"
                });
            }
            else {
                const updatedUser = await User.update(
                    {
                        username,
                        address
                    },
                    {
                        where: {
                            id,
                            isActive: "true"
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
            }
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

    blockUserInGroup = async (req, res, next) => {
        try {
            const {id, groupId} = req.params;
            const  user = req.user;
            const group = await Group.find({
                where: {
                    id: groupId,
                    authorId: user.id
                }
            });
            if (group !== null ) {
                const newBlock = await Block.create({
                    authorId: id,
                    userId: id,
                    groupId
                });
                const block = await Block.find({
                    where: {
                        id: newBlock.id
                    },
                    include: [
                        {
                            model: User,
                            as: 'author'
                        },
                        {
                            model: User,
                            as: 'user'
                        },
                        {
                            model: Group,
                            as: 'group'
                        }
                    ]
                });
                return responseHelper.returnSuccess(res, {
                    block
                });
            }
            return responseHelper.returnError(res, new Error('You are not administrator'));
        } catch (e) {
            return responseHelper.returnError(res, e);
        }
    };

}