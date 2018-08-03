'use strict';
import {Group, User, Op, MemberGroup} from '../models';
import {responseHelper} from '../helpers';
import {groupRepository, memberGroupRepository} from '../repositories';
export default class GroupController {
    getListActiveGroups = async (req, res, next) => {
        try {
            const userLoginId = req.user.id;
            const memberGroups = await memberGroupRepository.getAll({
                where: {
                    userId: userLoginId
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                attributes: ['groupId']
            });
            const groupIds = memberGroups.map(item => item.groupId);
            const groups = await groupRepository
                .getAll(
                    {
                        where: {
                            id: groupIds
                        },
                        attributes: {
                            exclude: ['authorId']
                        },
                        order: [
                            ['createdAt', 'DESC']
                        ]
                    }
                );
            return responseHelper.returnSuccess(res, groups);
        } catch (e) {
            return responseHelper.returnError(res, e);
        }
    };

    getListGroup = async (req, res, next) => {
        try {
            const groups = await groupRepository.getAll(
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
            return responseHelper.returnSuccess(res, groups);
        } catch (e) {
            return responseHelper.returnError(res, e);
        }
    };

    createGroup = async (req, res, next) => {
        let newGroup = null;
        try {
            const userLoginId = req.user.id;
            let {name, avatar, type, partnerId, memberIds} = req.body;
            if (!type) {
                return responseHelper.returnError(res, new Error('type is required field'));
            }
            switch (type) {
                case 'private':
                    if (partnerId === undefined) {
                        return responseHelper.returnError(res, new Error('Partner is required for private group'));
                    }
                    const existGroup = await groupRepository.getOne({
                        where: {
                            [Op.or]: [
                                {
                                    authorId: userLoginId,
                                    partnerId
                                },
                                {
                                    authorId: partnerId,
                                    partnerId: userLoginId
                                }
                            ]
                        }
                    });

                    if (existGroup) {
                        return responseHelper.returnSuccess(res, existGroup);
                    }
                    memberIds = [userLoginId, partnerId];
                    break;
                case 'group':
                    if (memberIds === undefined || !Array.isArray(memberIds) || memberIds.length < 0) {
                        return responseHelper.returnError(res, new Error('Member is invalid'));
                    }
                    if (!memberIds.includes(userLoginId)) {
                        memberIds[memberIds.length] = userLoginId;
                    }
                    break;
                default:
                    return responseHelper.returnError(res, new Error('Type is invalid'));
            }
            newGroup = await groupRepository.create({
                name,
                avatar,
                type,
                authorId: userLoginId,
                partnerId
            });
            const memberGroup = memberIds.map(item => {
                return {
                    groupId: newGroup.id,
                    userId: item
                }
            });
            await memberGroupRepository.bulkCreate(memberGroup);
            const group = await groupRepository.getOne({
                where: {
                    id: newGroup.id
                }
            });
            return responseHelper.returnSuccess(res, group);
        } catch (e) {
            if (newGroup) {
                groupRepository.delete({
                    force: true,
                    where: {
                        id: newGroup.id
                    }
                });
            }
            return responseHelper.returnError(res, e);
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