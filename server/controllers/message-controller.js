'use strict';
import {Message, Group, User, Block} from '../models';

export default class MessageController {
    getListMessage = async (req, res, next) => {
        try {
            const messages = await Message.findAll(
                {
                    attributes: {
                        exclude: ['authorId', 'groupId']
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    include: [
                        {
                            model: User,
                            as: 'author'
                        },
                        {
                            model: Group,
                            as: 'group'
                        }
                    ]
                });
            return res.status(200).json({
                success: true,
                data: messages
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    createMessage = async (req, res, next) => {
        try {
            const {groupId, body, type} = req.body;
            const user = req.user;
            if (groupId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "groupId is required field"
                });
            }
            if (body === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "body is required field"
                });
            }
            if (type === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "type is required field"
                });
            }
            const block = await Block.find({
                where: {
                    authorId: user.id,
                    groupId
                }
            });
            if (block !== null) {
                return res.status(400).json({
                    success: false,
                    error: "Group had been blocked"
                });
            }
            const newMessage = await Message.create({
                authorId: user.id,
                groupId,
                body,
                type
            });
            const message = await Message.find({
                where: {
                    id: newMessage.id
                },
                attributes: {
                    exclude: ['authorId', 'groupId']
                },
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        model: Group,
                        as: 'group'
                    }
                ]
            });
            return res.status(200).json({
                success: true,
                data: message
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    getOneMessage = async (req, res, next) => {
        try {
            const {id} = req.params;
            const message = await Message.find({
                where: {
                    id
                },
                attributes: {
                    exclude: ['authorId', 'groupId']
                },
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        model: Group,
                        as: 'group'
                    }
                ]
            });
            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'message is not exist'
                });
            }
            return res.status(200).json({
                success: true,
                data: message
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    deleteMessage = async (req, res, next) => {
        try {
            const {id} = req.params;
            await Message.destroy({
                where: {
                    id
                }
            });
            return res.status(200).json({
                success: true,
                data: true
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    updateMessage = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {authorId, groupId, body, type} = req.body;
            if (!authorId) {
                return res.status(400).json({
                    success: false,
                    error: 'User is not exist'
                });
            }
            const updateMessage = await User.update(
                {
                    authorId,
                    groupId,
                    body,
                    type
                },
                {
                    where: {
                        id
                    },
                    returning: true
                }
            );
            if (updateMessage[0] === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot update user'
                });
            }
            return res.status(200).json({
                success: true,
                data: updateMessage[1]
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
}