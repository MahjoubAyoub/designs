// Set design public/private
export const setToPublic = async (req, res, repo) => {
  const { id } = req.params;
  const { public: isPublic } = req.body;
  try {
    let design;
    try {
      design = await repo.findOneBy({ id: Number(id) });
    } catch (dbError) {
      console.error('Database error when finding design, possibly corrupted JSON data:', dbError);
      // Try to update using query builder to avoid loading corrupted JSON
      const result = await repo.createQueryBuilder()
        .update('Design')
        .set({ public: !!isPublic })
        .where('id = :id', { id: Number(id) })
        .execute();
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Design not found" });
      }
      return res.status(200).json({ message: `Design set to ${isPublic ? 'public' : 'private'}` });
    }
    
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
    let design;
    try {
      design = await repo.findOneBy({ id: Number(id) });
    } catch (dbError) {
      console.error('Database error when finding design by ID, possibly corrupted JSON data:', dbError);
      // Try to get the raw data using a raw SQL query to bypass JSON parsing
      try {
        const rawResult = await repo.manager.query(
          `SELECT d.id, d.name, d.public, d.dateCreation, d.dateModification, d.depuisTemplate, d.imageUrl, d.data, u.id as userId, u.nom, u.email 
           FROM designs d 
           LEFT JOIN users u ON d.userId = u.id 
           WHERE d.id = ?`, 
          [Number(id)]
        );
        
        if (!rawResult || rawResult.length === 0) {
          return res.status(404).json({ message: "Design not found" });
        }
        
        const rawDesign = rawResult[0];
        design = {
          id: rawDesign.id,
          name: rawDesign.name,
          public: rawDesign.public,
          dateCreation: rawDesign.dateCreation,
          dateModification: rawDesign.dateModification,
          depuisTemplate: rawDesign.depuisTemplate,
          imageUrl: rawDesign.imageUrl,
          user: rawDesign.userId ? {
            id: rawDesign.userId,
            nom: rawDesign.nom,
            email: rawDesign.email
          } : null
        };
        
        // Try to parse the raw data string manually
        if (rawDesign.data) {
          try {
            design.data = JSON.parse(rawDesign.data);
          } catch (parseError) {
            console.error('Failed to parse design data JSON:', parseError);
            // If JSON parsing fails, return the raw string so frontend can handle it
            design.data = rawDesign.data;
          }
        } else {
          design.data = {};
        }
        
        return res.status(200).json(design);
      } catch (rawQueryError) {
        console.error('Raw query also failed:', rawQueryError);
        return res.status(500).json({ message: "Unable to retrieve design data" });
      }
    }
    
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }
    
    // Parse the data field from string to object
    if (design.data && typeof design.data === 'string') {
      try {
        design.data = JSON.parse(design.data);
        console.log(`🔍 Design ${id} data parsed successfully:`, {
          hasPages: !!design.data.pages,
          pagesCount: design.data.pages?.length || 0,
          hasChildren: !!(design.data.pages?.[0]?.children),
          childrenCount: design.data.pages?.[0]?.children?.length || 0,
          dataKeys: Object.keys(design.data)
        });
      } catch (parseError) {
        console.error('Failed to parse design data JSON:', parseError);
        design.data = {};
      }
    }
    
    console.log(`📤 Sending design ${id} to frontend with data structure:`, {
      hasData: !!design.data,
      dataType: typeof design.data,
      dataKeys: design.data ? Object.keys(design.data) : []
    });
    
    return res.status(200).json(design);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getAllDesigns = async (req, res, repo) => {
  try {
    const { userId, public: publicOnly } = req.query;
    let where = {};
    let relations = [];
    
    if (userId) {
      where.user = { id: Number(userId) };
      relations.push('user');
    }
    if (publicOnly !== undefined) {
      where.public = publicOnly === 'true' || publicOnly === true;
    }
    
    const findOptions = { where };
    if (relations.length > 0) {
      findOptions.relations = relations;
    }
    
    let designs;
    try {
      designs = Object.keys(where).length > 0 ? await repo.find(findOptions) : await repo.find();
    } catch (dbError) {
      console.error('Database error, possibly corrupted JSON data:', dbError);
      // If there's a JSON parsing error, try to get designs without the problematic data field
      const queryBuilder = repo.createQueryBuilder('design');
      if (userId) {
        queryBuilder.leftJoinAndSelect('design.user', 'user')
                   .where('design.userId = :userId', { userId: Number(userId) });
      }
      if (publicOnly !== undefined) {
        const publicCondition = publicOnly === 'true' || publicOnly === true;
        if (userId) {
          queryBuilder.andWhere('design.public = :public', { public: publicCondition });
        } else {
          queryBuilder.where('design.public = :public', { public: publicCondition });
        }
      }
      
      // Select only safe fields, excluding the potentially corrupted data field
      const selectFields = [
        'design.id',
        'design.name', 
        'design.public',
        'design.dateCreation',
        'design.dateModification',
        'design.depuisTemplate',
        'design.imageUrl'
      ];
      
      // Only select user fields if we have a user relation
      if (userId) {
        selectFields.push('user.id', 'user.nom', 'user.email');
      }
      
      queryBuilder.select(selectFields);
      
      designs = await queryBuilder.getMany();
    }
    
    // Parse the data field from string to object for each design
    if (designs && designs.length > 0) {
      designs.forEach(design => {
        if (design.data && typeof design.data === 'string') {
          try {
            design.data = JSON.parse(design.data);
          } catch (parseError) {
            console.error(`Failed to parse design data JSON for design ${design.id}:`, parseError);
            design.data = {};
          }
        }
      });
    }
    
    res.json(designs);
  } catch (error) {
    console.error('Error fetching designs:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDesign = async (req, res, repo) => {
  try {
    const { userId, data, ...rest } = req.body;
    const design = repo.create({ 
      ...rest,
      data: data ? JSON.stringify(data) : null
    });
    if (userId) {
      design.user = { id: userId };
    }
    const result = await repo.save(design);

    // Generate preview after saving
    if (result) {
      try {
        const { generateDesignPreview } = await import('../../services/previewService.js');
        // Parse the data field if it's a string
        let designData = result.data;
        if (typeof designData === 'string') {
          try {
            designData = JSON.parse(designData);
          } catch (parseError) {
            console.warn('Failed to parse design data for preview:', parseError);
            designData = {};
          }
        }
        const previewData = generateDesignPreview({ data: designData });
        if (previewData) {
          result.imageUrl = previewData;
          await repo.save(result);
        }
      } catch (previewError) {
        console.warn('Failed to generate design preview:', previewError);
      }
      
      return res.status(201).json({
        data: result,
        message: "Design has been created"
      });
    }
    return res.status(500).json({
      message: "Server error"
    });
  } catch (error) {
    console.error('Error creating design:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateDesign = async (req, res, repo) => {
  const { id } = req.params;
  const { userId, data, ...updateData } = req.body;

  try {
    let design;
    try {
      // Find existing design by id
      design = await repo.findOneBy({ id: Number(id) });
    } catch (dbError) {
      console.error('Database error when finding design for update, possibly corrupted JSON data:', dbError);
      // If we can't load the design due to corrupted JSON, try direct update
      const updateQuery = repo.createQueryBuilder()
        .update('Design')
        .where('id = :id', { id: Number(id) });
      
      const setData = { 
        ...updateData,
        data: data ? JSON.stringify(data) : undefined
      };
      if (userId) {
        // For the query builder, we need to set the foreign key column directly
        setData.user = userId; // TypeORM will handle the foreign key mapping
      }
      
      const result = await updateQuery.set(setData).execute();
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Design not found" });
      }
      
      return res.status(200).json({
        data: { id: Number(id), ...setData },
        message: "Design updated successfully",
      });
    }
    
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Merge updateData into found design
    const mergeData = {
      ...updateData,
      data: data ? JSON.stringify(data) : design.data
    };
    repo.merge(design, mergeData);
    if (userId) {
      design.user = { id: userId };
    }

    // Save updated design
    const result = await repo.save(design);
    
    // Generate preview after updating if data changed
    if (data && !updateData.imageUrl) {
      try {
        const { generateDesignPreview } = await import('../../services/previewService.js');
        // Parse the data field if it's a string
        let designData = result.data;
        if (typeof designData === 'string') {
          try {
            designData = JSON.parse(designData);
          } catch (parseError) {
            console.warn('Failed to parse design data for preview:', parseError);
            designData = {};
          }
        }
        const previewData = generateDesignPreview({ data: designData });
        if (previewData) {
          result.imageUrl = previewData;
          await repo.save(result);
        }
      } catch (previewError) {
        console.warn('Failed to generate design preview:', previewError);
      }
    }

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

// Export design as JSON
export const exportDesign = async (req, res, repo) => {
  const { id } = req.params;
  try {
    let design;
    try {
      design = await repo.findOneBy({ id: Number(id) });
    } catch (dbError) {
      console.error('Database error when finding design for export, possibly corrupted JSON data:', dbError);
      // Try to get the raw data using a raw SQL query to bypass JSON parsing
      try {
        const rawResult = await repo.manager.query(
          `SELECT d.id, d.name, d.public, d.dateCreation, d.dateModification, d.depuisTemplate, d.imageUrl, d.data, u.id as userId, u.nom, u.email 
           FROM designs d 
           LEFT JOIN users u ON d.userId = u.id 
           WHERE d.id = ?`, 
          [Number(id)]
        );
        
        if (!rawResult || rawResult.length === 0) {
          return res.status(404).json({ message: "Design not found" });
        }
        
        const rawDesign = rawResult[0];
        design = {
          id: rawDesign.id,
          name: rawDesign.name,
          public: rawDesign.public,
          dateCreation: rawDesign.dateCreation,
          dateModification: rawDesign.dateModification,
          depuisTemplate: rawDesign.depuisTemplate,
          imageUrl: rawDesign.imageUrl,
          data: rawDesign.data, // Keep as string for export
          user: rawDesign.userId ? {
            id: rawDesign.userId,
            nom: rawDesign.nom,
            email: rawDesign.email
          } : null
        };
      } catch (rawError) {
        console.error('Raw query also failed:', rawError);
        return res.status(500).json({ message: "Unable to retrieve design data", error: rawError.message });
      }
    }
    
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Create exportable JSON structure
    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      design: {
        id: design.id,
        name: design.name,
        dateCreation: design.dateCreation,
        dateModification: design.dateModification,
        depuisTemplate: design.depuisTemplate,
        imageUrl: design.imageUrl,
        data: typeof design.data === 'string' ? design.data : JSON.stringify(design.data),
        user: design.user ? {
          id: design.user.id,
          nom: design.user.nom,
          email: design.user.email
        } : null
      }
    };

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${design.name || 'design'}_export.json"`);
    
    return res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting design:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Import design from JSON
export const importDesign = async (req, res, repo) => {
  try {
    const importData = req.body;
    
    // Validate import data structure
    if (!importData.design) {
      return res.status(400).json({ message: "Invalid import data: missing design object" });
    }

    const { design: designData } = importData;
    
    // Create new design from imported data
    const newDesign = repo.create({
      name: `${designData.name || 'Imported Design'} (Copy)`,
      data: designData.data,
      depuisTemplate: designData.depuisTemplate || false,
      imageUrl: designData.imageUrl,
      public: false // Set imported designs as private by default
    });

    const result = await repo.save(newDesign);

    return res.status(201).json({
      data: result,
      message: "Design imported successfully"
    });
  } catch (error) {
    console.error('Error importing design:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
   }
 };
