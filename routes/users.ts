import express from 'express';
import {getUser, createUser, login} from '../controllers/users';

const router = express.Router();

router.post('/', createUser);
router.post('/login', login);
router.get('/:id', getUser);

export default router;
