import express from 'express';
import authenticated from "../middleware/authenticated";
import {createEntry, getEntry} from "../controllers/inventory";

const router = express.Router();

router.use(authenticated);

router.post('/', createEntry);
router.get('/:id', getEntry);

// TODO implement controller function for this
router.post('/search');

export default router;
