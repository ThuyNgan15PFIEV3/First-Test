'use strict';
import {User, Group, MemberGroup} from '../models';
import {Op} from '../models';
import {encryptHelper,  JWTHelper} from '../helpers/index';
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
}