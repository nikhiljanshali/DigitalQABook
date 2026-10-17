import pool from '../config/db.js';

// GET all Q&A items with optional filtering by chapterId, search query, difficulty, tag
export const getAllQa = async (req, res, next) => {
  try {
    const { chapterId, search, difficulty, tag } = req.query;
    const conditions = [];
    const values = [];

    if (chapterId) {
      values.push(parseInt(chapterId, 10));
      conditions.push(`q.chapter_id = $${values.length}`);
    }

    if (difficulty) {
      values.push(difficulty);
      conditions.push(`q.difficulty ILIKE $${values.length}`);
    }

    if (tag) {
      values.push(`%${tag}%`);
      conditions.push(`array_to_string(q.tags, ',') ILIKE $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(q.question ILIKE $${values.length} OR q.answer ILIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        q.id,
        q.chapter_id,
        c.title AS chapter_title,
        q.question,
        q.answer,
        q.difficulty,
        q.tags,
        q.order_index,
        q.created_at,
        q.updated_at
      FROM qa_items q
      JOIN chapters c ON c.id = q.chapter_id
      ${whereClause}
      ORDER BY c.order_index ASC, q.order_index ASC, q.id ASC;
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET single Q&A by ID
export const getQaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        q.id,
        q.chapter_id,
        c.title AS chapter_title,
        q.question,
        q.answer,
        q.difficulty,
        q.tags,
        q.order_index,
        q.created_at,
        q.updated_at
      FROM qa_items q
      JOIN chapters c ON c.id = q.chapter_id
      WHERE q.id = $1;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Q&A item with ID ${id} not found.`,
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

// POST create Q&A item
export const createQa = async (req, res, next) => {
  try {
    const { chapter_id, question, answer, difficulty = 'Intermediate', tags = [], order_index = 1 } = req.body;

    if (!chapter_id || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'chapter_id, question, and answer are required fields.',
      });
    }

    // Verify chapter exists
    const chapterCheck = await pool.query('SELECT id, title FROM chapters WHERE id = $1', [chapter_id]);
    if (chapterCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Chapter with ID ${chapter_id} does not exist.`,
      });
    }

    // Ensure tags is an array
    const normalizedTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const query = `
      INSERT INTO qa_items (chapter_id, question, answer, difficulty, tags, order_index)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      parseInt(chapter_id, 10),
      question.trim(),
      answer.trim(),
      difficulty,
      normalizedTags,
      parseInt(order_index, 10) || 1,
    ]);

    const createdItem = {
      ...result.rows[0],
      chapter_title: chapterCheck.rows[0].title,
    };

    res.status(201).json({
      success: true,
      message: 'Q&A item created successfully.',
      data: createdItem,
    });
  } catch (error) {
    next(error);
  }
};

// PUT update Q&A item
export const updateQa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chapter_id, question, answer, difficulty, tags, order_index } = req.body;

    const existingRes = await pool.query('SELECT * FROM qa_items WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Q&A item with ID ${id} not found.`,
      });
    }

    const current = existingRes.rows[0];

    let targetChapterId = current.chapter_id;
    if (chapter_id !== undefined) {
      const chapterCheck = await pool.query('SELECT id, title FROM chapters WHERE id = $1', [chapter_id]);
      if (chapterCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Chapter with ID ${chapter_id} does not exist.`,
        });
      }
      targetChapterId = parseInt(chapter_id, 10);
    }

    let normalizedTags = current.tags;
    if (tags !== undefined) {
      normalizedTags = Array.isArray(tags)
        ? tags.map(t => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    }

    const newQuestion = question !== undefined ? question.trim() : current.question;
    const newAnswer = answer !== undefined ? answer.trim() : current.answer;
    const newDifficulty = difficulty !== undefined ? difficulty : current.difficulty;
    const newOrderIndex = order_index !== undefined ? parseInt(order_index, 10) : current.order_index;

    const query = `
      UPDATE qa_items
      SET 
        chapter_id = $1,
        question = $2,
        answer = $3,
        difficulty = $4,
        tags = $5,
        order_index = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;

    const result = await pool.query(query, [
      targetChapterId,
      newQuestion,
      newAnswer,
      newDifficulty,
      normalizedTags,
      newOrderIndex,
      id,
    ]);

    const chapterRes = await pool.query('SELECT title FROM chapters WHERE id = $1', [targetChapterId]);

    res.json({
      success: true,
      message: 'Q&A item updated successfully.',
      data: {
        ...result.rows[0],
        chapter_title: chapterRes.rows[0]?.title || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Q&A item
export const deleteQa = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM qa_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Q&A item with ID ${id} not found.`,
      });
    }

    res.json({
      success: true,
      message: 'Q&A item deleted successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
