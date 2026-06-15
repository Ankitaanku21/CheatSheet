const Resource = require('../models/Resource');
const { parseFileFromUrl } = require('../utils/fileParser');
const { generateSummary, extractTopics, answerQuestion } = require('../utils/aiAssistant');

const extractText = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.extractedText) return res.json({ extracted: true, cached: true });

    const { text } = await parseFileFromUrl(resource.fileUrl);
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ message: 'No extractable text found in this file' });
    }

    resource.extractedText = text;
    await resource.save();
    res.json({ extracted: true, cached: false, length: text.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId).populate('subject', 'name');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (resource.aiSummary) {
      return res.json({ summary: resource.aiSummary, cached: true });
    }

    if (!resource.extractedText) {
      return res.status(400).json({ message: 'Text not extracted yet. Call extract-text first.' });
    }

    const summary = await generateSummary(resource.extractedText, resource.subject?.name || 'General');
    resource.aiSummary = summary;
    resource.aiSummaryGeneratedAt = new Date();
    await resource.save();
    res.json({ summary, cached: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopics = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId).populate('subject', 'name');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (resource.aiTopics && resource.aiTopics.length > 0) {
      return res.json({ topics: resource.aiTopics, cached: true });
    }

    if (!resource.extractedText) {
      return res.status(400).json({ message: 'Text not extracted yet. Call extract-text first.' });
    }

    const topics = await extractTopics(resource.extractedText, resource.subject?.name || 'General');
    resource.aiTopics = topics;
    resource.aiTopicsGeneratedAt = new Date();
    await resource.save();
    res.json({ topics, cached: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (!resource.extractedText) {
      return res.status(400).json({ message: 'Text not extracted yet. Call extract-text first.' });
    }

    const answer = await answerQuestion(resource.extractedText, question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { extractText, getSummary, getTopics, askQuestion };
