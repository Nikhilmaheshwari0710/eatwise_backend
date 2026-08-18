const ChatMessage = require('../models/ChatMessage');

exports.sendMessage = async (req, res, next) => {
  try {
    const { content, sessionId } = req.body;

    await ChatMessage.create({ user: req.user._id, role: 'user', content, sessionId });

    // Placeholder AI response — integrate OpenAI/Gemini here
    const aiReply = generateMockReply(content);

    const assistantMsg = await ChatMessage.create({
      user: req.user._id,
      role: 'assistant',
      content: aiReply,
      sessionId,
    });

    res.json({ success: true, reply: assistantMsg });
  } catch (error) {
    next(error);
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const messages = await ChatMessage.find({ user: req.user._id, sessionId }).sort('createdAt');
    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatMessage.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$sessionId', lastMessage: { $last: '$content' }, updatedAt: { $max: '$createdAt' } } },
      { $sort: { updatedAt: -1 } },
    ]);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

function generateMockReply(question) {
  const q = question.toLowerCase();
  if (q.includes('sugar')) return 'Excess sugar in children\'s food can lead to obesity, tooth decay, and energy crashes. Look for products with less than 5g of added sugar per serving.';
  if (q.includes('allergy') || q.includes('allergic')) return 'Common food allergens include milk, eggs, peanuts, tree nuts, wheat, soy, fish, and shellfish. Always check labels carefully and consult your pediatrician.';
  if (q.includes('lunchbox') || q.includes('lunch')) return 'A balanced lunchbox should include a protein (paneer, egg, dal), a grain (roti, rice), fruits/veggies, and a healthy snack. Avoid packaged juices — use fresh fruit instead!';
  if (q.includes('organic')) return 'Organic foods are grown without synthetic pesticides. While beneficial, the most important thing is a balanced diet rich in whole foods, whether organic or not.';
  return 'That\'s a great question! As a nutrition AI assistant, I recommend focusing on whole, minimally processed foods for your family. Would you like specific product recommendations?';
}
