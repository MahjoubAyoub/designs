import express from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { getAllDesigns, createDesign, updateDesign, deleteDesign, getDesignById, setToPublic, exportDesign, importDesign } from './design.controller.js';

const router = express.Router();
const designRepo = () => AppDataSource.getRepository('Design');

// Get all designs
router.get('/', async (req, res) => {
  const repo = designRepo();
  return getAllDesigns(req, res, repo);
});

// Get a design by id
router.get('/:id', async (req, res) => {
  const repo = designRepo();
  return getDesignById(req, res, repo);
});

// Delete a design by id
router.delete('/:id', async (req, res) => {
  const repo = designRepo();
  return deleteDesign(req, res, repo);
});
// Save (create or update) design in one route for autosave or explicit save
router.post('/save', async (req, res) => {
  const repo = designRepo();
  const { id, ...data } = req.body;
  if (id) {
    // Update existing design
    req.params = { id };
    return updateDesign(req, res, repo);
  } else {
    // Create new design
    return createDesign(req, res, repo);
  }
});
router.get('/test', (req, res) => res.send('Designs router is working!'));

// Set design public/private
router.patch('/:id/public', async (req, res) => {
  const repo = designRepo();
  return setToPublic(req, res, repo);
});

// Export design as JSON
router.get('/:id/export', async (req, res) => {
  const repo = designRepo();
  return exportDesign(req, res, repo);
});

// Import design from JSON
router.post('/import', async (req, res) => {
  const repo = designRepo();
  return importDesign(req, res, repo);
});

export default router;