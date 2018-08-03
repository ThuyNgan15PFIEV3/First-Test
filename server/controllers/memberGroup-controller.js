'use strict';
import {User, Group, MemberGroup, Op} from '../models';
import {encryptHelper,  JWTHelper, responseHelper} from '../helpers/index';
import {groupRepository, memberGroupRepository} from '../repositories';
export default class MemberGroupController {

    getListMember = async (req, res, next) => {
        try {
            const member = await MemberGroup.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            });
            return res.status(200).json({
                success: true,
                data: member
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            })
        }
    };

    createMember = async (req, res, next) => {
        try {
            const {userId, groupId} = req.body;
            const newMember = await MemberGroup.create({
                userId,
                groupId
            });
            return res.status(200).json({
                success: true,
                data: newMember
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            })
        }
    };

    getOneMember = async (req, res, next) => {
        try {
            const {id} = req.params;
            const member = await MemberGroup.findById(id);
            if (!member) {
                return res.status(400).json({
                    success: false,
                    error: 'Member is not exist in group'
                });
            }
            return res.status(200).json({
                success: true,
                data: member
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    deleteMember = async (req, res, next) => {
        try {
            const {id} = req.params;
            const  user = req.user;
            const count = await MemberGroup.destroy({
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
            })
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };

    updateMember = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {userId, groupId} = req.body;
            const updatedMember = await MemberGroup.update(
                {
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
            if (updatedMember[0] === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot update member'
                });
            }
            return res.status(200).json({
                success: true,
                data: updatedMember[1]
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: e.message
            });
        }
    };
    leaveGroup = async (req, res, next) => {
        try {
            const groupId = req.params.id;
            const  userLoginId = req.user.id;
            const group = await groupRepository.getOne({
                where: {
                    id: groupId,
                    type: 'group'
                },
                attribute: []
            });
            if (!group) {
                return responseHelper.returnError(res, new Error('You are trying to leave private group'));
            }
            const isAuthorGroup = await groupRepository.getOne({
                where: {
                    id: groupId,
                    authorId: userLoginId
                },
                attributes: []
            });

            if (isAuthorGroup) {
                await groupRepository.delete({
                    where: {
                        id: groupId
                    }
                });
                return responseHelper.returnSuccess(res, true);
            }
            const count = await memberGroupRepository.delete({
                where: {
                    groupId,
                    userId: userLoginId
                }
            });
            if (count === 0 ) {
                return responseHelper.returnError(res, new Error('You are not user of this account or you are not member in group'));
            }
            return responseHelper.returnSuccess(res, data);
        } catch (e) {
            return responseHelper.returnError(res, e);
        }
    };
    inviteToGroup = async (req, res, next) => {
        try {
            const groupId = req.params.id;
            const  userLoginId = req.user.id;
            const {invitedUserId} = req.body;
            const isExistMember =  memberGroupRepository.getOne({
                where: {
                    groupId,
                    userId: invitedUserId
                },
                paranoid: false
            });
            if (!isExistMember) {
                await  MemberGroup.create({
                    groupId: id,
                    userId: invitedUserId
                });
            }  else if (isExistMember.deletedAt) {
                await memberGroupRepository.update(
                    {
                        deletedAt: null
                    },
                    {
                        where: {
                            id: isExistMember.id
                        },
                        paranoid: false
                    }
                );
            }
            return responseHelper.returnError(res, new Error('This user has been exist in group'));
        } catch (e) {
            return responseHelper.returnError(res, e);
        }
    };
}