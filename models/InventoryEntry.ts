import {
    Table,
    Column,
    Model,
    DataType,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    Unique,
    Default
} from 'sequelize-typescript';

@Table
export default class InventoryEntry extends Model<InventoryEntry> {
    @AllowNull(false)
    @Column(DataType.STRING(16))
    room: string;

    @AllowNull(false)
    @Column(DataType.INTEGER.UNSIGNED)
    number: number;

    @AllowNull(false)
    @Column(DataType.STRING(16))
    serial: string;

    @AllowNull(false)
    @Column(DataType.STRING(64))
    model: string;

    @AllowNull(false)
    @Column(DataType.STRING(64))
    cpu: string;

    @AllowNull(false)
    @Column(DataType.STRING(16))
    clockSpeed: string;

    @AllowNull(false)
    @Column(DataType.STRING(16))
    ram: string;

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE(3))
    createdAt: Date;

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE(3))
    updatedAt: Date;
}