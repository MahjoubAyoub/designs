import express from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { getAllDesigns, createDesign, updateDesign, deleteDesign } from './design.controller.js';

const router = express.Router();
const designRepo = () => AppDataSource.getRepository('Design');

router.get('/', (req, res) => getAllDesigns(req, res, designRepo()));
router.post('/', (req, res) => createDesign(req, res, designRepo()));
router.put('/:id', (req, res) => updateDesign(req, res, designRepo()));
router.delete('/:id', (req, res) => deleteDesign(req, res, designRepo()));

export default router;