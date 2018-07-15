'use strict';
let bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    min: 5, // checking
                    isEmail: true
                }
            },
            password: {
                allowNull: false,
                type: DataTypes.STRING,
                validate: {
                    min: 10,
                    max: 120
                }
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            address: {
                type: DataTypes.ARRAY(DataTypes.STRING)
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
            paranoid: true,
            freezeTableName: true,
            // instanceMethods: {
            //     generateHash(password) {
            //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
            //     },
            //     validPassword(password) {
            //         return bcrypt.compare(password, this.password);
            //     }
            // }
            //
        }
    );

    User.associate = (models) => {
        User.hasMany(models.Group, {
            foreignKey: 'authorId',
            as: 'group'
        });
        User.hasMany(models.Block, {
            foreignKey: 'authorId',
            as: 'block'
        });
    };

    return User;
};
