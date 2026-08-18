const CommunityPost = require('../models/CommunityPost');

exports.createPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const query = category ? { category } : {};

    const posts = await CommunityPost.find(query)
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments(query);
    res.json({ success: true, posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

exports.addReply = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.replies.push({ user: req.user._id, content: req.body.content });
    await post.save();

    const updated = await CommunityPost.findById(post._id)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar');
    res.status(201).json({ success: true, post: updated });
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);

    await post.save();
    res.json({ success: true, likesCount: post.likes.length, liked: idx === -1 });
  } catch (error) {
    next(error);
  }
};
