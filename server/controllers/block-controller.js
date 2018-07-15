'use strict';
import {Group, User, Block} from '../models';

export default class GroupController {
    getListBlock = async (req, res, next) => {
        try {
            const blocks = await Block.findAll(
                {
                    attributes: {
                        exclude: ['authorId', 'userId', 'groupId']
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
                            model: User,
                            as: 'user'
                        },
                        {
                            model: Group,
                            as: 'group'
                        }
                    ]
                });
            return res.status(200).json({
                success: true,
                data: blocks
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    createBlock = async (req, res, next) => {
        try {
            const {authorId, userId, groupId} = req.body;
            if (authorId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "authorId is required field"
                });
            }
            if (userId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "userId is required field"
                });
            }
            if (groupId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "groupId is required field"
                });
            }
            const newBlock= await Block.create({
                authorId,
                userId,
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
            return res.status(200).json({
                success: true,
                data: block
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    getOneBlock = async (req, res, next) => {
        try {
            const {id} = req.params;
            const block = await Block.find({
                where: {
                    id
                },
                attributes: {
                    exclude: ['authorId', 'userId', 'groupId']
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
            if (!block) {
                return res.status(400).json({
                    success: false,
                    error: 'block is not exist'
                });
            }
            return res.status(200).json({
                success: true,
                data: block
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    deleteBlock = async (req, res, next) => {
        try {
            const {id} = req.params;
            await Block.destroy({
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
    updateBlock = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {authorId, userId, groupId, type} = req.body;
            if (!authorId) {
                return res.status(400).json({
                    success: false,
                    error: 'User is not exist'
                });
            }
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User is not exist'
                });
            }
            if (!groupId) {
                return res.status(400).json({
                    success: false,
                    error: 'Group is not exist'
                });
            }
            const updateBlock = await Block.update(
                {
                    authorId,
                    userId,
                    groupId
                },
                {
                    where: {
                        id
                    },
                    returning: true
                }
            );
            if (updateBlock[0] === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot update block'
                });
            }
            return res.status(200).json({
                success: true,
                data: updateBlock[1]
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
}