import {Request, Response} from "express";
import Joi, {ValidationError} from 'joi';
import InventoryEntry from "../models/InventoryEntry";
import {Op} from 'sequelize';
import {AllowNull, Column, DataType} from "sequelize-typescript";

export const createEntry = async function (req: Request, res: Response) {
    const schema = Joi.object({
        room: Joi.string()
            .min(1)
            .max(16)
            .required(),
        number: Joi.number()
            .integer()
            .positive()
            .required(),
        domain: Joi.string()
            .min(1)
            .max(16)
            .required(),
        brand: Joi.string()
            .min(1)
            .max(64)
            .required(),
        model: Joi.string()
            .min(1)
            .max(64)
            .required(),
        serial: Joi.string()
            .min(1)
            .max(16)
            .required(),
        windowsVersion: Joi.string()
            .min(1)
            .max(8)
            .required(),
        windowsBuild: Joi.string()
            .min(1)
            .max(16)
            .required(),
        windowsRelease: Joi.string()
            .min(1)
            .max(16)
            .required(),
        cpu: Joi.string()
            .min(1)
            .max(64)
            .required(),
        clockSpeed: Joi.number()
            .integer()
            .positive()
            .required(),
        cpuCores: Joi.number()
            .integer()
            .positive()
            .required(),
        ram: Joi.number()
            .integer()
            .positive()
            .required(),
        disk: Joi.number()
            .integer()
            .positive()
            .required()
    });


    try {
        const data: {
            room: string,
            number: number,
            domain: string,
            brand: string,
            model: string,
            serial: string,
            windowsVersion: string,
            windowsBuild: string,
            windowsRelease: string,
            cpu: string,
            clockSpeed: number,
            cpuCores: number,
            ram: number,
            disk: number
        } = await schema.validate(req.body);

        const existing = await InventoryEntry.findOne({
            where: {
                number: data.number
            }
        });
        if(existing) {
            let changes = "";
            for(let field of ["room", "number", "domain", "brand", "model", "serial", "windowsVersion", "windowsBuild", "windowsRelease", "cpu", "clockSpeed", "cpuCores", "ram", "disk"]) {
                if(existing[field] !== data[field]) {
                    changes += `${field} was updated from ${existing[field]} to ${data[field]}.\n`;
                }
            }
            if(!changes) {
                changes = "No changes were made.";
            }
            else {
                await existing.update(data);
            }

            return res.status(200).send({message: changes});
        }
        else {
            const entry = await InventoryEntry.create(data);
            return res.status(201).send(entry);
        }

    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        console.error(err);
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
};

export const getEntry = async function (req: Request, res: Response) {
    const schema = Joi.object({
        id: Joi.number()
            .positive()
            .integer()
            .required()
    });
    try {
        const {id: entryId} = await schema.validate(req.params);

        const entry = await InventoryEntry.findOne({
            where: {
                id: entryId
            }
        });
        if (!entry) {
            return res.status(404).send({message: 'The entry was not found.'});
        }

        return res.send(entry);
    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
};

export const search = async function (req: Request, res: Response) {
    const operator = Joi.string()
        .valid('=', '>', '>=', '<', '<=')
        .optional();
    const schema = Joi.object({
        search: Joi.object({
            room: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator
            }).optional(),
            number: Joi.object({
                value: Joi.number()
                    .integer()
                    .positive()
                    .required(),
                operator
            }).optional(),
            domain: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator
            }),
            brand: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(64)
                    .required(),
                operator
            }).optional(),
            model: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(64)
                    .required(),
                operator
            }).optional(),
            serial: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator
            }).optional(),
            windowsVersion: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(8)
                    .required(),
                operator
            }).optional(),
            windowsBuild: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator
            }).optional(),
            windowsRelease: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator
            }).optional(),
            cpu: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(64)
                    .required(),
                operator
            }).optional(),
            clockSpeed: Joi.object({
                value: Joi.number()
                    .integer()
                    .positive()
                    .required(),
                operator
            }).optional(),
            cpuCores: Joi.object({
                value: Joi.number()
                    .integer()
                    .positive()
                    .required(),
                operator
            }).optional(),
            ram: Joi.object({
                value: Joi.number()
                    .integer()
                    .positive()
                    .required(),
                operator
            }).optional(),
            disk: Joi.object({
                value: Joi.number()
                    .positive()
                    .required(),
                operator
            }).optional()
        }).optional(),
        sort: Joi.object({
            key: Joi.string()
                .valid('room', 'number', 'domain', 'brand', 'model', 'serial', 'windowsVersion', 'windowsBuild', 'windowsRelease', 'cpu', 'clockSpeed', 'cpuCores', 'ram', 'disk'),
            direction: Joi.string()
                .valid('ASC', 'DESC')
        }).optional(),
        after: Joi.number()
            .integer()
            .positive()
            .optional()
    });

    try {
        const input: {
            search: {
                room: { value: string, operator: string | undefined } | undefined,
                number: { value: number, operator: string | undefined } | undefined,
                domain: { value: string, operator: string | undefined } | undefined,
                brand: { value: string, operator: string | undefined } | undefined,
                model: { value: string, operator: string | undefined } | undefined,
                serial: { value: string, operator: string | undefined } | undefined,
                windowsVersion: { value: string, operator: string | undefined } | undefined,
                windowsBuild: { value: string, operator: string | undefined } | undefined,
                windowsRelease: { value: string, operator: string | undefined } | undefined,
                cpu: { value: string, operator: string | undefined } | undefined,
                clockSpeed: { value: number, operator: string | undefined } | undefined,
                cpuCores: { value: number, operator: string | undefined } | undefined,
                ram: { value: number, operator: string | undefined } | undefined,
                disk: { value: number, operator: string | undefined } | undefined
            },
            sort: { key: string, direction: string } | undefined
            after: number | undefined
        } = await schema.validate(req.body);

        const flat = {...input.search, after: input.after};
        if (!Object.values(flat).length) {
            return res.send(await InventoryEntry.findAll({
                limit: 25
            }));
        }

        const searchQuery = (Object.entries(input.search || []) as [string, { value: string | number, operator: string | undefined }][])
            .filter(field => field)
            .map(([label, data]) => {
                let op;
                switch (data.operator) {
                    case '>':
                        op = Op.gt;
                        break;
                    case '>=':
                        op = Op.gte;
                        break;
                    case '<':
                        op = Op.lt;
                        break;
                    case '<=':
                        op = Op.lte;
                        break;
                    default:
                        op = Op.eq;
                        break;
                }
                return {
                    [label]: {
                        [op]: data.value
                    }
                }
            });
        let query;
        if (searchQuery.length) {
            query = {
                where: {
                    [Op.and]: {
                        id: {
                            [Op.gt]: input.after || 0
                        },
                        [Op.and]: searchQuery
                    }
                },
                limit: 25
            }
        } else {
            query = {
                where: {
                    id: {
                        [Op.gt]: input.after || 0
                    }
                },
                limit: 25
            }
        }
        if (input.sort) {
            query.order = [[input.sort.key, input.sort.direction]]
        }

        const results = await InventoryEntry.findAll(query);
        return res.send(results);

    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        console.error(err);
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
};