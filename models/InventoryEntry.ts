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
    domain: string;

    @AllowNull(false)
    @Column(DataType.STRING(64))
    brand: string

    @AllowNull(false)
    @Column(DataType.STRING(64))
    model: string;

    @AllowNull(false)
    @Column(DataType.STRING(16))
    serial: string;

    @AllowNull(false)
    @Column(DataType.STRING(8))
    windowsVersion: string;

    @AllowNull(false)
    @Column(DataType.STRING(16))
    windowsBuild: string;

    @AllowNull(false)
    @Column(DataType.STRING(16))
    windowsRelease: string;

    @AllowNull(false)
    @Column(DataType.STRING(64))
    cpu: string;

    @AllowNull(false)
    @Column(DataType.INTEGER.UNSIGNED)
    clockSpeed: number;

    @AllowNull(false)
    @Column(DataType.INTEGER.UNSIGNED)
    cpuCores: number;

    @AllowNull(false)
    @Column(DataType.INTEGER.UNSIGNED)
    ram: number;

    @AllowNull(false)
    @Column(DataType.FLOAT.UNSIGNED)
    disk: number;

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE(3))
    createdAt: Date;

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE(3))
    updatedAt: Date;
}