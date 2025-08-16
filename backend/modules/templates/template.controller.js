export const getAllTemplates = async (req, res, repo) => {
  try {
    const templates = await repo.find({ relations: ['user'] });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const getTemplateById = async (req, res, repo) => {
  try {
    const template = await repo.findOne({ where: { id: Number(req.params.id) }, relations: ['user'] });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching template' });
  }
};

export const createTemplate = async (req, res, repo) => {
  try {
    const { userId, ...templateData } = req.body;
    
    // Create template with user association
    const template = repo.create({
      ...templateData,
      user: userId ? { id: userId } : null
    });
    
    const result = await repo.save(template);
    
    res.status(201).json({
      data: result,
      message: 'Template created successfully',
    });
  } catch (err) {
    console.error('Template creation error:', err);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

export const updateTemplate = async (req, res, repo) => {
  try {
    const template = await repo.findOneBy({ id: Number(req.params.id) });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    repo.merge(template, req.body);
    const result = await repo.save(template);
    
    res.status(200).json({
      data: result,
      message: 'Template updated successfully',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req, res, repo) => {
  try {
    const template = await repo.findOneBy({ id: Number(req.params.id) });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    await repo.remove(template);
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

// Get all JSON Resume templates
export const getJsonResumeTemplates = async (req, res, repo) => {
  try {
    const templates = await repo.find({ 
      where: { type: 'json-resume' }, 
      relations: ['user'] 
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch JSON Resume templates' });
  }
};

// Get JSON Resume template by ID
export const getJsonResumeTemplateById = async (req, res, repo) => {
  try {
    const template = await repo.findOne({ 
      where: { id: Number(req.params.id), type: 'json-resume' }, 
      relations: ['user'] 
    });
    if (!template) return res.status(404).json({ error: 'JSON Resume template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching JSON Resume template' });
  }
};

// Create JSON Resume template
export const createJsonResumeTemplate = async (req, res, repo) => {
  try {
    const templateData = {
      ...req.body,
      type: 'json-resume',
      category: 'resume'
    };
    const template = repo.create(templateData);
    const result = await repo.save(template);
    res.status(201).json({
      data: result,
      message: 'JSON Resume template created successfully',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create JSON Resume template' });
  }
};

// Upload template with media files
export const uploadTemplateWithMedia = async (req, res, repo) => {
  try {
    const { name, description, category, type = 'design', theme, public: isPublic = true, templateData } = req.body;
    const uploadedFiles = req.files || [];
    
    // Process uploaded files
    const mediaFiles = uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));
    
    // Parse template data if provided as string
    let parsedTemplateData = null;
    if (templateData) {
      try {
        parsedTemplateData = typeof templateData === 'string' ? JSON.parse(templateData) : templateData;
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid template data format' });
      }
    }
    
    // Create template with media references
    const template = repo.create({
      name: name || 'Custom Template',
      description: description || 'Template with uploaded media',
      content: {
        ...parsedTemplateData,
        mediaFiles: mediaFiles,
        uploadedAt: new Date().toISOString()
      },
      category: category || 'custom',
      type: type,
      theme: theme,
      public: isPublic === 'true' || isPublic === true
    });
    
    const result = await repo.save(template);
    
    res.status(201).json({
      data: result,
      message: 'Template with media uploaded successfully',
      uploadedFiles: mediaFiles.length
    });
  } catch (err) {
    console.error('Upload template error:', err);
    res.status(500).json({ error: 'Failed to upload template with media' });
  }
};