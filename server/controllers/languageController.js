import Language from '../models/Language.js';

/*
 * GET /api/languages
 * Fetch all active languages
 */
export async function getLanguages(req, res) {
  try {
    console.log('[LANGUAGE] Fetching languages...');
    const languages = await Language.find({ active: true }).sort({ name: 1 });
    console.log('[LANGUAGE] Languages fetched:', languages.length);
    res.json({ data: languages });
  } catch (error) {
    console.error('[LANGUAGE] Error fetching languages:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/languages/:slug
 * Fetch a single language by slug
 */
export async function getLanguageBySlug(req, res) {
  try {
    console.log('[LANGUAGE] Fetching language by slug:', req.params.slug);
    const language = await Language.findOne({ slug: req.params.slug, active: true });
    if (!language) {
      console.log('[LANGUAGE] Language not found:', req.params.slug);
      return res.status(404).json({ error: 'Language not found' });
    }
    console.log('[LANGUAGE] Language fetched:', language.name);
    res.json({ data: language });
  } catch (error) {
    console.error('[LANGUAGE] Error fetching language:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/languages
 * Admin: Create a new language
 */
export async function createLanguage(req, res) {
  try {
    console.log('[LANGUAGE] Creating language:', req.body.name);
    const language = await Language.create(req.body);
    console.log('[LANGUAGE] Language created:', language._id);
    res.status(201).json({ data: language });
  } catch (error) {
    console.error('[LANGUAGE] Error creating language:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/languages/:id
 * Admin: Update a language
 */
export async function updateLanguage(req, res) {
  try {
    console.log('[LANGUAGE] Updating language:', req.params.id);
    const language = await Language.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!language) return res.status(404).json({ error: 'Language not found' });
    console.log('[LANGUAGE] Language updated:', language._id);
    res.json({ data: language });
  } catch (error) {
    console.error('[LANGUAGE] Error updating language:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/languages/:id
 * Admin: Delete a language
 */
export async function deleteLanguage(req, res) {
  try {
    console.log('[LANGUAGE] Deleting language:', req.params.id);
    const language = await Language.findByIdAndDelete(req.params.id);
    if (!language) return res.status(404).json({ error: 'Language not found' });
    console.log('[LANGUAGE] Language deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[LANGUAGE] Error deleting language:', error.message);
    res.status(500).json({ error: error.message });
  }
}
