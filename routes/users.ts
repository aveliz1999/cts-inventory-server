import express from 'express';
import {getUser, createUser, login} from '../controllers/users';
import authenticated from "../middleware/authenticated";

const router = express.Router();

router.post('/', createUser);
router.post('/login', login);

router.use(authenticated);

router.get('/:id', getUser);

export default router;
