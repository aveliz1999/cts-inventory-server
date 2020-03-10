import {Request, Response} from "express";
import User from '../models/User';
import Joi, {ValidationError} from 'joi';

export const getUser = async function (req: Request, res: Response) {
    const schema = Joi.object({
        id: Joi.number()
            .positive()
            .integer()
            .required()
    });
    try {
        const {id: userId} = (await Joi.validate(req.params, schema));

        const user = await User.findOne({
            where: {
                id: userId
            }
        });
        if (!user) {
            return res.status(404).send({message: 'The user was not found.'});
        }

        return res.send(user);
    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send((err as ValidationError).message);
        }
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}