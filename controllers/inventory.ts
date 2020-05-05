import {Request, Response} from "express";
import Joi, {ValidationError} from 'joi';
import InventoryEntry from "../models/InventoryEntry";
import User from "../models/User";
import {Op} from 'sequelize';


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
        serial: Joi.string()
            .min(1)
            .max(16)
            .required(),
        model: Joi.string()
            .min(1)
            .max(64)
            .required(),
        cpu: Joi.string()
            .min(1)
            .max(64)
            .required(),
        clockSpeed: Joi.string()
            .min(1)
            .max(16)
            .required(),
        ram: Joi.string()
            .min(1)
            .max(16)
            .required(),
    });

    try {
        const data: { room: string, number: number, serial: string, model: string, cpu: string, clockSpeed: string, ram: string }
            = await schema.validate(req.body);

        const entry = await InventoryEntry.create(data);
        return res.status(201).send(entry);

    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
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
    const schema = Joi.object({
        search: Joi.object({
            room: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator: Joi.string()
                    .valid('=', '>', '>=', '<', '<=')
                    .optional()
            }).optional(),
            number: Joi.object({
                value: Joi.number()
                    .integer()
                    .positive()
                    .required(),
                operator: Joi.string()
                    .valid('=', '>', '>=', '<', '<=')
                    .optional()
            }).optional(),
            serial: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator: Joi.string()
                    .valid('=', '>', '>=', '<', '<=')
                    .optional()
            }).optional(),
            model: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(64)
                    .required(),
                operator: Joi.string()
                    .valid('=', '>', '>=', '<', '<=')
                    .optional()
            }).optional(),
            cpu: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(64)
                    .required(),
                operator: Joi.string()
                    .valid('=', '>', '>=', '<', '<=')
                    .optional()
            }).optional(),
            clockSpeed: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator: Joi.string()
                    .valid('=', '>', '>=', '<', '<=')
                    .optional()
            }).optional(),
            ram: Joi.object({
                value: Joi.string()
                    .min(1)
                    .max(16)
                    .required(),
                operator: Joi.string()
                    .valid('=', '>', '>=', '<', '<=')
                    .optional()
            }).optional()
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
                serial: { value: string, operator: string | undefined } | undefined,
                model: { value: string, operator: string | undefined } | undefined,
                cpu: { value: string, operator: string | undefined } | undefined,
                clockSpeed: { value: string, operator: string | undefined } | undefined,
                ram: { value: string, operator: string | undefined } | undefined
            },
            after: number | undefined
        } = await schema.validate(req.body);

        const flat = {...input, ...input.search};
        delete flat.search;
        if (!Object.values(flat).length) {
            return res.status(400).send({
                message: 'Must provide one or more of the following: [room, number, serial, model, cpu, clockSpeed, ram, after]'
            });
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
                        [Op.or]: searchQuery
                    }
                },
                limit: 10
            }
        } else {
            query = {
                where: {
                    [Op.and]: {
                        id: {
                            [Op.gt]: input.after || 0
                        }
                    }
                },
                limit: 10
            }
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