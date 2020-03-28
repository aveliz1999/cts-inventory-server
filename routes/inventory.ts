import express from 'express';
import authenticated from "../middleware/authenticated";
import {createEntry} from "../controllers/inventory";

const router = express.Router();

router.use(authenticated);

router.post('/', createEntry);

// TODO implement controller function for these
router.get('/:id');
router.post('/search');

export default router;
