import express from 'express';
import {create} from "../controllers/qr";

const router = express.Router();

router.post('/', create);

export default router;

