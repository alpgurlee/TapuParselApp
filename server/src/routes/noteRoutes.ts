import express, { Router } from 'express';
import * as noteController from '../controllers/noteController';

const router: Router = express.Router();

router.get('/', noteController.getNotes);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

export default router;
