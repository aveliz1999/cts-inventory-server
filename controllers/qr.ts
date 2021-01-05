import {Request, Response} from "express";
import Joi, {ValidationError} from 'joi';
import {QRCodeWriter, BarcodeFormat} from "@zxing/library";
import Jimp from "jimp";

export const create = async function (req: Request, res: Response) {
    const regex = /DOMAIN:(.+)\nBRAND:(.+)\nMODEL:(.+)\nSERIALNUMBER:(.+)\nWINDOWSVERSION:(.+)\nWINDOWSBUILD:(.+)\nWINDOWSRELEASE:(.+)\nCPUMODEL:(.+)\nCPUSPEED:(.+)\nCPUCORES:(.+)\nRAM:(.+)\nDISK:(.+)/;
    const bodySchema = Joi.object({
        payload: Joi.string()
            .regex(regex)
    });

    const schema = Joi.object({
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
        const {payload} = await bodySchema.validate(req.body);
        const [, domain, brand, model, serial, windowsVersion, windowsBuild, windowsRelease, cpu, clockSpeed, cpuCores, ram, disk] = payload.match(regex) as string[];
        const json = {
            domain,
            brand,
            model,
            serial,
            windowsVersion,
            windowsBuild,
            windowsRelease,
            cpu,
            clockSpeed,
            cpuCores,
            ram,
            disk
        };

        const data: {
            domain: string,
            brand: string,
            model: string,
            serial: string,
            windowsVersion: string,
            windowsBuild: string,
            windowsRelease: string,
            cpu: string,
            clockSpeed: string,
            cpuCores: string,
            ram: string,
            disk: string
        } = await schema.validate(json);

        const code = new QRCodeWriter().encode(JSON.stringify(data), BarcodeFormat.QR_CODE, 256, 256, null);
        const image = new Jimp(256, 256);

        for (let i = 0; i < code.getWidth(); i++) {
            for (let j = 0; j < code.getHeight(); j++) {
                image.setPixelColor(code.get(i, j) ? 0 : 0xffffffff, i, j);
            }
        }
        
        return res.status(200).type('png').send(await image.getBufferAsync('image/png'));

    } catch (err) {
        if (err.isJoi) {
            return res.status(400).send({message: (err as ValidationError).message});
        }
        return res.status(500).send({message: 'An error has occurred on the server.'})
    }
}