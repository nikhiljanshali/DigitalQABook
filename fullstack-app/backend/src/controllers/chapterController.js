import pool from '../config/db.js';

export const getAllChapters = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.order_index, 
        c.created_at,
        COUNT(q.id)::int AS qa_count
      FROM chapters c
      LEFT JOIN qa_items q ON q.chapter_id = c.id
      GROUP BY c.id
      ORDER BY c.order_index ASC, c.id ASC;
    `;
    const result = await pool.query(query);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.order_index, 
        c.created_at,
        COUNT(q.id)::int AS qa_count
      FROM chapters c
      LEFT JOIN qa_items q ON q.chapter_id = c.id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Chapter with ID ${id} not found.`,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/chapters
export const createChapter = async (req, res, next) => {
  try {
    const { title, description = '', order_index } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Chapter title is required.',
      });
    }

    let targetOrderIndex = order_index ? parseInt(order_index, 10) : null;
    if (!targetOrderIndex) {
      const maxOrderRes = await pool.query('SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order FROM chapters;');
      targetOrderIndex = parseInt(maxOrderRes.rows[0].next_order, 10);
    }

    const query = `
      INSERT INTO chapters (title, description, order_index)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, order_index, created_at;
    `;
    const result = await pool.query(query, [title.trim(), description.trim(), targetOrderIndex]);

    res.status(201).json({
      success: true,
      message: 'Chapter created successfully.',
      data: {
        ...result.rows[0],
        qa_count: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/chapters/:id
export const updateChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order_index } = req.body;

    const existingRes = await pool.query('SELECT * FROM chapters WHERE id = $1;', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Chapter with ID ${id} not found.`,
      });
    }

    const current = existingRes.rows[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDescription = description !== undefined ? description.trim() : current.description;
    const newOrderIndex = order_index !== undefined ? parseInt(order_index, 10) : current.order_index;

    if (!newTitle) {
      return res.status(400).json({
        success: false,
        message: 'Chapter title cannot be empty.',
      });
    }

    const query = `
      UPDATE chapters
      SET 
        title = $1,
        description = $2,
        order_index = $3
      WHERE id = $4
      RETURNING id, title, description, order_index, created_at;
    `;
    const updateRes = await pool.query(query, [newTitle, newDescription, newOrderIndex, id]);

    // Get count of qa items
    const countRes = await pool.query('SELECT COUNT(*)::int AS qa_count FROM qa_items WHERE chapter_id = $1;', [id]);

    res.json({
      success: true,
      message: 'Chapter updated successfully.',
      data: {
        ...updateRes.rows[0],
        qa_count: countRes.rows[0].qa_count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/chapters/:id
export const deleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM chapters WHERE id = $1 RETURNING *;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Chapter with ID ${id} not found.`,
      });
    }

    res.json({
      success: true,
      message: 'Chapter and its questions deleted successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
