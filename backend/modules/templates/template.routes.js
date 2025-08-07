import express from 'express';
import multer from 'multer';
import { AppDataSource } from '../../config/data-source.js';
import { getAllTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, getJsonResumeTemplates, getJsonResumeTemplateById, createJsonResumeTemplate, uploadTemplateWithMedia } from './template.controller.js';

const router = express.Router();
const templateRepo = () => AppDataSource.getRepository('Template');

// Configure multer for template media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `template-${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept images and common design files
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/json' ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only image files, JSON, and text files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.get('/', (req, res) => getAllTemplates(req, res, templateRepo()));
router.get('/:id', (req, res) => getTemplateById(req, res, templateRepo()));
router.post('/', (req, res) => createTemplate(req, res, templateRepo()));
router.put('/:id', (req, res) => updateTemplate(req, res, templateRepo()));
router.delete('/:id', (req, res) => deleteTemplate(req, res, templateRepo()));

// JSON Resume specific routes
router.get('/json-resume/all', (req, res) => getJsonResumeTemplates(req, res, templateRepo()));
router.get('/json-resume/:id', (req, res) => getJsonResumeTemplateById(req, res, templateRepo()));
router.post('/json-resume', (req, res) => createJsonResumeTemplate(req, res, templateRepo()));

// Template upload with media files
router.post('/upload-with-media', upload.array('media', 10), (req, res) => uploadTemplateWithMedia(req, res, templateRepo()));

export default router;