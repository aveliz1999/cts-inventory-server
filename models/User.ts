import {Table, Column, Model, DataType, AllowNull, CreatedAt, UpdatedAt} from 'sequelize-typescript';

@Table
export default class User extends Model<User> {
    @AllowNull(false)
    @Column(DataType.STRING(16))
    username: string;

    @AllowNull(false)
    @Column(DataType.STRING(32))
    name: string;

    @AllowNull(false)
    @Column(DataType.CHAR(60))
    password: string;

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE(3))
    createdAt: Date;

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE(3))
    updatedAt: Date;
}