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

    const searchFields = {
        room: Joi.object({
            value: Joi.string()
                .min(1)
                .max(16)
                .required(),
            operator
        }),
        number: Joi.object({
            value: Joi.number()
                .integer()
                .positive()
                .required(),
            operator
        }),
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
        }),
        model: Joi.object({
            value: Joi.string()
                .min(1)
                .max(64)
                .required(),
            operator
        }),
        serial: Joi.object({
            value: Joi.string()
                .min(1)
                .max(16)
                .required(),
            operator
        }),
        windowsVersion: Joi.object({
            value: Joi.string()
                .min(1)
                .max(8)
                .required(),
            operator
        }),
        windowsBuild: Joi.object({
            value: Joi.string()
                .min(1)
                .max(16)
                .required(),
            operator
        }),
        windowsRelease: Joi.object({
            value: Joi.string()
                .min(1)
                .max(16)
                .required(),
            operator
        }),
        cpu: Joi.object({
            value: Joi.string()
                .min(1)
                .max(64)
                .required(),
            operator
        }),
        clockSpeed: Joi.object({
            value: Joi.number()
                .integer()
                .positive()
                .required(),
            operator
        }),
        cpuCores: Joi.object({
            value: Joi.number()
                .integer()
                .positive()
                .required(),
            operator
        }),
        ram: Joi.object({
            value: Joi.number()
                .integer()
                .positive()
                .required(),
            operator
        }),
        disk: Joi.object({
            value: Joi.number()
                .positive()
                .required(),
            operator
        })
    }

    const schema = Joi.object({
        search: Joi.array()
            .items([
                {
                    key: Joi.string()
                        .valid('room', 'number', 'domain', 'brand', 'model', 'serial', 'windowsVersion', 'windowsBuild', 'windowsRelease', 'cpu', 'clockSpeed', 'cpuCores', 'ram', 'disk')
                        .required(),
                    value: Joi.any().required()
                }
            ]).optional(),
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
        const {search, sort, after}: {
            search?: {
                key: string,
                value: any
            }[],
            sort?: { key: string, direction: string },
            after?: number
        } = await schema.validate(req.body);
        const searchTerms: {
            term: string,
            value: any,
            operator: string
        }[] = [];
        if(search) {
            for(let term of search) {
                const value = await searchFields[term.key].validate(term.value);
                value.term = term.key;
                searchTerms.push(value);
            }
        }

        if (!sort && !after && !searchTerms.length) {
            return res.send(await InventoryEntry.findAll({
                limit: 25
            }));
        }

        const searchQuery = searchTerms.map(data => {
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
                [data.term]: {
                    [op]: data.value
                }
            }
        })

        let query;
        if (searchQuery.length) {
            query = {
                where: {
                    [Op.and]: {
                        id: {
                            [Op.gt]: after || 0
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
                        [Op.gt]: after || 0
                    }
                },
                limit: 25
            }
        }
        if (sort) {
            query.order = [[sort.key, sort.direction]]
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