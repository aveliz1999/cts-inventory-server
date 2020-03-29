import {Request, Response} from "express";
import Joi, {ValidationError} from 'joi';
import InventoryEntry from "../models/InventoryEntry";
import User from "../models/User";

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