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
    const template = repo.create(req.body);
    const result = await repo.save(template);
    res.status(201).json({
      data: result,
      message: 'Template created successfully',
    });
  } catch (err) {
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