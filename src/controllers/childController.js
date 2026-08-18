const User = require('../models/User');

exports.addChild = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.children.push(req.body);
    await user.save();
    res.status(201).json({ success: true, children: user.children });
  } catch (error) {
    next(error);
  }
};

exports.updateChild = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const child = user.children.id(req.params.childId);
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    Object.assign(child, req.body);
    await user.save();
    res.json({ success: true, children: user.children });
  } catch (error) {
    next(error);
  }
};

exports.deleteChild = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.children.pull(req.params.childId);
    await user.save();
    res.json({ success: true, children: user.children });
  } catch (error) {
    next(error);
  }
};

exports.getChildren = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, children: user.children });
  } catch (error) {
    next(error);
  }
};
