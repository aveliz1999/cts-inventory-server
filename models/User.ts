import {
    Table,
    Column,
    Model,
    DataType,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    DefaultScope,
    Scopes,
    Unique
} from 'sequelize-typescript';

@DefaultScope(() => ({
    attributes: [
        'id', 'username', 'name', 'createdAt', 'updatedAt'
    ]
}))
@Scopes(() => ({
    withPassword: {
        attributes: [
            'id', 'username', 'password', 'name', 'createdAt', 'updatedAt'
        ]
    }
}))
@Table
export default class User extends Model<User> {
    @AllowNull(false)
    @Unique
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

User.prototype.toJSON = function (): object {
    const values = Object.assign({}, this.get());

    delete values.password;
    return values;
}