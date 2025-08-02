// Set design public/private
export const setToPublic = async (req, res, repo) => {
  const { id } = req.params;
  const { public: isPublic } = req.body;
  try {
    const design = await repo.findOneBy({ id: Number(id) });
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }
    design.public = !!isPublic;
    await repo.save(design);
    return res.status(200).json({ message: `Design set to ${isPublic ? 'public' : 'private'}` });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a design by id
export const getDesignById = async (req, res, repo) => {
  const { id } = req.params;
  try {
    const design = await repo.findOneBy({ id: Number(id) });
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }
    return res.status(200).json(design);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getAllDesigns = async (req, res, repo) => {
  const { userId, public: publicOnly } = req.query;
  let where = {};
  if (userId) {
    where.user = { id: Number(userId) };
  }
  if (publicOnly !== undefined) {
    where.public = publicOnly === 'true' || publicOnly === true;
  }
  const designs = Object.keys(where).length > 0 ? await repo.find({ where }) : await repo.find();
  res.json(designs);
};

export const createDesign = async (req, res, repo) => {
  const { userId, ...rest } = req.body;
  const design = repo.create({ ...rest });
  if (userId) {
    design.user = { id: userId };
  }
  const result = await repo.save(design);

  if (result) {
    return res.status(201).json({
      data: result,
      message: "Design has been created"
    });
  }
  return res.status(500).json({
    message: "Server error"
  });
};

export const updateDesign = async (req, res, repo) => {
  const { id } = req.params;
  const { userId, ...updateData } = req.body;

  try {
    // Find existing design by id
    const design = await repo.findOneBy({ id: Number(id) });
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Merge updateData into found design
    repo.merge(design, updateData);
    if (userId) {
      design.user = { id: userId };
    }

    // Save updated design
    const result = await repo.save(design);

    return res.status(200).json({
      data: result,
      message: "Design updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};




export const deleteDesign = async (req, res, repo) => {
  const { id } = req.params;

  try {
    const design = await repo.findOneBy({ id: Number(id) });
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    await repo.remove(design);

    return res.status(200).json({
      message: "Design deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
