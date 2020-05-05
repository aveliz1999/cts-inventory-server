import express from 'express';
import authenticated from "../middleware/authenticated";
import {createEntry, getEntry, search} from "../controllers/inventory";

const router = express.Router();

router.use(authenticated);

router.post('/', createEntry);
router.get('/:id', getEntry);
router.post('/search', search);

export default router;
