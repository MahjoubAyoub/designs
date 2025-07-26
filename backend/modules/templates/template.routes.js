import express from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { getAllTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate } from './template.controller.js';

const router = express.Router();
const templateRepo = () => AppDataSource.getRepository('Template');

router.get('/', (req, res) => getAllTemplates(req, res, templateRepo()));
router.get('/:id', (req, res) => getTemplateById(req, res, templateRepo()));
router.post('/', (req, res) => createTemplate(req, res, templateRepo()));
router.put('/:id', (req, res) => updateTemplate(req, res, templateRepo()));
router.delete('/:id', (req, res) => deleteTemplate(req, res, templateRepo()));

export default router;