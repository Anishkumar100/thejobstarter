import imagekit from '../config/imagekit.js';

/*
 * POST /api/media/upload
 * Admin: Upload an image to ImageKit
 */
export async function uploadMedia(req, res) {
  try {
    const { file, fileName, folder } = req.body;
    console.log('[MEDIA] Uploading file:', fileName);

    const result = await imagekit.upload({
      file,
      fileName,
      folder: folder || '/thewebytes/'
    });

    console.log('[MEDIA] File uploaded:', result.fileId);
    res.json({ url: result.url, fileId: result.fileId, name: result.name });
  } catch (error) {
    console.error('[MEDIA] Error uploading file:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/media
 * Admin: List all media files from ImageKit
 */
export async function listMedia(req, res) {
  try {
    console.log('[MEDIA] Listing files...');
    const files = await imagekit.listFiles({ path: '/thewebytes/' });
    console.log('[MEDIA] Files listed:', files.length);
    res.json({ data: files });
  } catch (error) {
    console.error('[MEDIA] Error listing files:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/media/:fileId
 * Admin: Delete a media file from ImageKit
 */
export async function deleteMedia(req, res) {
  try {
    console.log('[MEDIA] Deleting file:', req.params.fileId);
    await imagekit.deleteFile(req.params.fileId);
    console.log('[MEDIA] File deleted:', req.params.fileId);
    res.json({ success: true });
  } catch (error) {
    console.error('[MEDIA] Error deleting file:', error.message);
    res.status(500).json({ error: error.message });
  }
}
