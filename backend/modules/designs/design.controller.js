export const getAllDesigns = async (req, res, repo) => {
  const designs = await repo.find();
  res.json(designs);
};

export const createDesign = async (req, res, repo) => {
  const design = repo.create(req.body);
  const result = await repo.save(design);

  if (result) {
    res.status(201).json({
      data: result,
      message: "Design has been created"
    });
  }

  res.status(500).json({
    message: "Server error"
  });
};

export const updateDesign = async (req, res, repo) => {
  const { id } = req.params; 
  const updateData = req.body;

  try {
    // Find existing design by id
    const design = await repo.findOneBy({ id: Number(id) });
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Merge updateData into found design
    repo.merge(design, updateData);

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
