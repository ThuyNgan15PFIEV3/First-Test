'use strict';
import {Group, User, MemberGroup} from '../models';

export default class GroupController {
    getListGroup = async (req, res, next) => {
        try {
            const groups = await Group.findAll(
            {
                attributes: {
                    exclude: 'authorId'
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
                        model: MemberGroup,
                        as: 'members'
                    }
                ]
            });
            return res.status(200).json({
                success: true,
                data: groups
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    createGroup = async (req, res, next) => {
        try {
            const {name, avatar, authorId, type} = req.body;
            if (authorId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "authorId is required field"
                });
            }
            if (type === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "type is required field"
                });
            }
            const newGroup = await Group.create({
                name,
                avatar,
                authorId,
                type
            });
            const group = await Group.find({
                where: {
                    id: newGroup.id
                },
                include: [
                    {
                        model: User,
                        as: 'author'
                    }
                ]
            });
            return res.status(200).json({
                success: true,
                data: group
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    getOneGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const group = await Group.find({
                where: {
                    id
                },
                attributes: {
                    exclude: 'authorId'
                },
                include: [
                    {
                        model: User,
                        as: 'author'
                    },
                    {
                        model: MemberGroup,
                        as: 'members'
                    }
                ]
            });
            if (!group) {
                return res.status(400).json({
                    success: false,
                    error: 'Group is not exist'
                });
            }
            return res.status(200).json({
                success: true,
                data: group
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    deleteGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const  user = req.user;
            const count = await Group.destroy({
                where: {
                    id,
                    authorId: user.id
                }
            });
            if (count === 0 ) {
               return res.status(400).json({
                   success: false,
                   error: 'You are not administrator'
               });
            }
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

    updateGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {name, avatar, authorId, type} = req.body;
            if (!authorId) {
                return res.status(400).json({
                    success: false,
                    error: 'User is not exist'
                });
            }
            const updateGroup = await Group.update(
                {
                    name,
                    avatar,
                    authorId,
                    type
                },
                {
                    where: {
                        id
                    },
                    returning: true
                }
            );
            console.log(updateGroup);
            if (updateGroup[0] === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot update group'
                });
            }
            return res.status(200).json({
                success: true,
                data: updateGroup[1]
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };


}