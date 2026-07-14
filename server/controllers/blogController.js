import mongoose from 'mongoose';
import BlogPost from '../models/BlogPost.js';
import { clearCache } from '../middleware/cache.js';

/*
 * GET /api/blog
 * Fetch all blog posts, sorted newest first
 */
export async function getPosts(req, res) {
  try {
    console.log('[BLOG] Fetching posts...');
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    console.log('[BLOG] Posts fetched:', posts.length);
    res.json({ data: posts });
  } catch (error) {
    console.error('[BLOG] Error fetching posts:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/blog/:slug
 * Fetch single blog post by slug, increment view count
 */
export async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;
    console.log('[BLOG] Fetching post by slug/id:', slug);
    /*
     * Try lookup by MongoDB _id first (for admin edit),
     * fall back to slug lookup (for public detail pages)
     */
    let post;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      post = await BlogPost.findById(slug);
    }
    if (!post) {
      post = await BlogPost.findOne({ slug });
    }
    if (!post) {
      console.log('[BLOG] Post not found:', slug);
      return res.status(404).json({ error: 'Post not found' });
    }
    await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    console.log('[BLOG] Post fetched:', post.title);
    res.json({ data: post });
  } catch (error) {
    console.error('[BLOG] Error fetching post:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/blog
 * Admin: Create a new blog post
 */
export async function createPost(req, res) {
  try {
    console.log('[BLOG] Creating post:', req.body.title);
    const post = await BlogPost.create(req.body);
    clearCache();
    console.log('[BLOG] Post created:', post._id);
    res.status(201).json({ data: post });
  } catch (error) {
    console.error('[BLOG] Error creating post:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/blog/:id
 * Admin: Update an existing blog post
 */
export async function updatePost(req, res) {
  try {
    console.log('[BLOG] Updating post:', req.params.id);
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    clearCache();
    console.log('[BLOG] Post updated:', post._id);
    res.json({ data: post });
  } catch (error) {
    console.error('[BLOG] Error updating post:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/blog/:id
 * Admin: Delete a blog post
 */
export async function deletePost(req, res) {
  try {
    console.log('[BLOG] Deleting post:', req.params.id);
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    clearCache();
    console.log('[BLOG] Post deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[BLOG] Error deleting post:', error.message);
    res.status(500).json({ error: error.message });
  }
}
