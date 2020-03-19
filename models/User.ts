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
    Unique,
    Default
} from 'sequelize-typescript';

@DefaultScope(() => ({
    attributes: [
        'id', 'username', 'name', 'pendingPasswordReset', 'createdAt', 'updatedAt'
    ]
}))
@Scopes(() => ({
    withPassword: {
        attributes: [
            'id', 'username', 'password', 'name', 'pendingPasswordReset', 'createdAt', 'updatedAt'
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

    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    pendingPasswordReset: boolean;

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