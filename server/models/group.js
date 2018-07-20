'use strict';

module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING
            },
            authorId: {
                type: DataTypes.UUID
            },
            type: {
                type: DataTypes.STRING
            },
            avatar: {
                type: DataTypes.STRING
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            deletedAt: {
                type: DataTypes.DATE
            }
        },
        {
            paranoid: true, // Soft delete
            freezeTableName: true
        }
    );

    // Association

    Group.associate = (models) => {
        Group.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author'
        });
        Group.hasMany(models.MemberGroup, {
            foreignKey: 'groupId',
            as: 'members'
        });
    };

    // Static function

    // Hooks

    return Group;
};