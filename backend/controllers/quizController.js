const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { generateSubjectQuiz } = require('../utils/aiQuizGenerator');
const { parseFileFromUrl } = require('../utils/fileParser');
const { evaluateSubjectiveAnswers } = require('../utils/aiEvaluator');

function computeBreakdown(answers, totalQuestions) {
  const mcqScore = Math.min(
    answers.reduce((s, a) => {
      if (a.isCorrect === null || a.isCorrect === undefined) return s;
      return s + (a.marksAwarded ?? (a.isCorrect ? 1 : 0));
    }, 0),
    totalQuestions
  );
  const subjectiveScore = Math.min(
    answers.reduce((s, a) => {
      if (a.isCorrect !== null && a.isCorrect !== undefined) return s;
      return s + (a.marksAwarded ?? 0);
    }, 0),
    totalQuestions
  );
  const totalScore = Math.min(mcqScore + subjectiveScore, totalQuestions);
  const percentage = totalQuestions > 0 ? Math.min(Math.round((totalScore / totalQuestions) * 100), 100) : 0;
  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 75) grade = 'A';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 40) grade = 'C';
  return { mcqScore, subjectiveScore, totalScore, percentage, grade };
}

const getQuestions = async (req, res) => {
  try {
    const { resource, subject, branch, year } = req.query;
    const filter = {};
    if (resource) filter.resource = resource;
    if (subject) filter.subject = subject;
    if (branch) filter.branch = branch;
    if (year) filter.year = parseInt(year);
    const questions = await Question.find(filter)
      .populate('resource', 'title')
      .populate('subject', 'name');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestionsForQuiz = async (req, res) => {
  try {
    const { resource } = req.query;
    if (!resource) return res.status(400).json({ message: 'Resource ID required' });
    const questions = await Question.find({ resource })
      .select('-correctAnswer')
      .populate('resource', 'title');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('resource', 'title')
      .populate('subject', 'name');
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQuestions = async (req, res) => {
  try {
    const { resourceId, numQuestions } = req.body;
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource ID is required' });
    }
    const resource = await Resource.findById(resourceId).populate('subject', 'name');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    await Question.deleteMany({ resource: resourceId, source: 'ai-generated' });
    if (!resource.fileUrl) {
      return res.status(400).json({ message: 'Resource has no file attached' });
    }

    const { text, pageCount } = await parseFileFromUrl(resource.fileUrl);
    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        message: `This PDF (${pageCount} page(s)) has no extractable text — it may be scanned or image-based. Upload a text-based PDF or try OCR.`
      });
    }

    const questionsData = await generateSubjectQuiz({
      subjectName: resource.subject?.name || 'General',
      pyqText: text,
      numQuestions: numQuestions || 10,
      difficulty: 'medium'
    });

    const created = [];
    for (const q of questionsData) {
      const question = await Question.create({
        resource: resourceId,
        subject: resource.subject,
        branch: resource.branch,
        year: resource.year,
        semester: resource.semester,
        type: q.type || 'objective',
        questionType: q.questionType || 'mcq',
        difficulty: q.difficulty || 'medium',
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.type === 'objective' ? q.correctAnswer : undefined,
        expectedAnswer: q.expectedAnswer || '',
        explanation: q.explanation || '',
        source: 'ai-generated'
      });
      created.push(question);
    }
    res.status(201).json({ count: created.length, questions: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateSubjectQuizController = async (req, res) => {
  try {
    const { subjectId, numQuestions = 10, difficulty = 'medium' } = req.body;
    if (!subjectId) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    await Question.deleteMany({ subject: subjectId, source: 'ai-generated' });

    const subject = await Subject.findById(subjectId).populate('branch').populate('semester');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const pyqs = await Resource.find({ subject: subjectId, type: 'pyq' });
    if (pyqs.length === 0) {
      return res.status(400).json({ message: 'No PYQs found for this subject. Upload PYQs first.' });
    }

    let aggregatedText = '';
    for (const pyq of pyqs) {
      try {
        const { text } = await parseFileFromUrl(pyq.fileUrl);
        if (text && text.trim().length > 20) {
          aggregatedText += `\n\n--- PYQ: ${pyq.title} ---\n\n${text}`;
        }
      } catch (e) {
        console.error(`Failed to parse ${pyq.fileUrl}:`, e.message);
      }
    }

    if (!aggregatedText || aggregatedText.trim().length < 20) {
      return res.status(400).json({
        message: `None of the ${pyqs.length} PYQ(s) for this subject have extractable text. They may be scanned/image-based PDFs. Upload text-based PDFs or try OCR.`
      });
    }

    const questionsData = await generateSubjectQuiz({
      subjectName: subject.name,
      pyqText: aggregatedText,
      numQuestions,
      difficulty
    });

    const created = [];
    for (const q of questionsData) {
      const question = await Question.create({
        subject: subjectId,
        branch: subject.branch?._id,
        semester: subject.semester?._id,
        type: q.type || 'objective',
        questionType: q.questionType || 'mcq',
        difficulty: q.difficulty || difficulty,
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.type === 'objective' ? q.correctAnswer : undefined,
        expectedAnswer: q.expectedAnswer || '',
        explanation: q.explanation || '',
        source: 'ai-generated'
      });
      created.push(question);
    }

    res.status(201).json({ count: created.length, questions: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { resource, subject: subjectId, answers, timeTaken } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array required' });
    }

    let filter = {};
    if (resource) filter.resource = resource;
    if (subjectId) filter.subject = subjectId;
    if (!resource && !subjectId) {
      return res.status(400).json({ message: 'Resource ID or Subject ID required' });
    }

    const questions = await Question.find(filter);
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found' });
    }

    const questionMap = {};
    questions.forEach(q => { questionMap[q._id.toString()] = q; });

    let objectiveCorrect = 0;
    const subjectiveForAI = [];
    const processedAnswers = [];

    for (const a of answers) {
      const q = questionMap[a.questionId];
      if (!q) {
        processedAnswers.push({ questionId: a.questionId, selectedAnswer: a.selectedAnswer, isCorrect: false, marksAwarded: 0, aiFeedback: '' });
        continue;
      }

      if (q.type === 'subjective') {
        const userAnswer = a.textAnswer || '';
        subjectiveForAI.push({
          idx: processedAnswers.length,
          questionText: q.questionText,
          expectedAnswer: q.expectedAnswer || '',
          userAnswer
        });
        processedAnswers.push({
          questionId: q._id,
          selectedAnswer: userAnswer,
          isCorrect: null,
          marksAwarded: null,
          maxMarks: 1,
          aiFeedback: '',
          aiEvaluated: false
        });
      } else {
        const isCorrect = q.correctAnswer === a.selectedAnswer;
        if (isCorrect) objectiveCorrect++;
        processedAnswers.push({
          questionId: q._id,
          selectedAnswer: a.selectedAnswer,
          isCorrect,
          marksAwarded: isCorrect ? 1 : 0,
          maxMarks: 1,
          aiFeedback: '',
          aiEvaluated: false
        });
      }
    }

    if (subjectiveForAI.length > 0) {
      const results = await evaluateSubjectiveAnswers(
        subjectiveForAI.map(s => ({
          questionText: s.questionText,
          expectedAnswer: s.expectedAnswer,
          userAnswer: s.userAnswer
        }))
      );
      results.forEach((r, i) => {
        const idx = subjectiveForAI[i].idx;
        processedAnswers[idx].marksAwarded = r.score / 100;
        processedAnswers[idx].aiFeedback = r.feedback;
        processedAnswers[idx].aiEvaluated = true;
      });
    }

    const { mcqScore, subjectiveScore, totalScore, percentage, grade } = computeBreakdown(processedAnswers, questions.length);
    const objectiveTotal = questions.filter(q => q.type === 'objective').length;
    const subjectiveTotal = questions.filter(q => q.type === 'subjective').length;

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      resource: resource || undefined,
      subject: subjectId || questions[0].subject,
      score: totalScore,
      totalQuestions: questions.length,
      mcqScore,
      subjectiveScore,
      percentage,
      grade,
      answers: processedAnswers,
      timeTaken: timeTaken || 0
    });

    const populated = await QuizAttempt.findById(attempt._id)
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer expectedAnswer type questionType explanation difficulty'
      });

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.quizStats.totalQuizzes += 1;
        user.quizStats.totalCorrect = Math.round((user.quizStats.totalCorrect + totalScore) * 10) / 10;
        user.quizStats.totalAttempted += questions.length;
        user.quizStats.averageScore = user.quizStats.totalAttempted > 0
          ? Math.round((user.quizStats.totalCorrect / user.quizStats.totalAttempted) * 100)
          : 0;
        const acc = user.quizStats.averageScore;
        const tq = user.quizStats.totalQuizzes;
        if (acc >= 90 && tq >= 20) user.quizStats.rating = 5;
        else if (acc >= 75 && tq >= 10) user.quizStats.rating = 4;
        else if (acc >= 60 && tq >= 5) user.quizStats.rating = 3;
        else if (acc >= 40 && tq >= 3) user.quizStats.rating = 2;
        else if (acc >= 20 && tq >= 1) user.quizStats.rating = 1;
        else user.quizStats.rating = 0;
        await user.save();
      }
    } catch (e) {
      console.error('Failed to update quiz stats:', e.message);
    }

    res.json({
      attemptId: attempt._id,
      mcqScore,
      mcqTotal: objectiveTotal,
      subjectiveScore,
      subjectiveTotal,
      totalScore,
      totalQuestions: questions.length,
      percentage,
      grade,
      answers: populated.answers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('resource', 'title type')
      .populate('subject', 'name')
      .sort('-createdAt');
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function evaluateAttemptSubjective(attempt) {
  const subjectiveToEval = attempt.answers
    .map((a, idx) => ({ answer: a, idx }))
    .filter(({ answer: a }) => {
      const q = a.questionId;
      return q && q.type === 'subjective' && !a.aiEvaluated;
    });

  if (subjectiveToEval.length === 0) {
    if (!attempt.mcqScore && !attempt.subjectiveScore) {
      const { mcqScore, subjectiveScore, totalScore, percentage, grade } = computeBreakdown(attempt.answers, attempt.totalQuestions);
      attempt.mcqScore = mcqScore;
      attempt.subjectiveScore = subjectiveScore;
      attempt.score = totalScore;
      attempt.percentage = percentage;
      attempt.grade = grade;
      await attempt.save();
      return true;
    }
    return false;
  }

  const aiInput = subjectiveToEval.map(({ answer: a }) => {
    const q = a.questionId;
    return {
      questionText: q.questionText || '',
      expectedAnswer: q.expectedAnswer || '',
      userAnswer: a.selectedAnswer || ''
    };
  });

  const results = await evaluateSubjectiveAnswers(aiInput);

  for (let i = 0; i < subjectiveToEval.length; i++) {
    const { answer: a } = subjectiveToEval[i];
    const r = results[i] || { score: 0, feedback: '' };
    a.marksAwarded = r.score / 100;
    a.aiFeedback = r.feedback;
    a.aiEvaluated = true;
  }

  const { mcqScore, subjectiveScore, totalScore, percentage, grade } = computeBreakdown(attempt.answers, attempt.totalQuestions);
  attempt.mcqScore = mcqScore;
  attempt.subjectiveScore = subjectiveScore;
  attempt.score = totalScore;
  attempt.percentage = percentage;
  attempt.grade = grade;
  await attempt.save();
  return true;
}

const getAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('resource', 'title type')
      .populate('subject', 'name')
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer expectedAnswer type questionType difficulty explanation'
      });
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await evaluateAttemptSubjective(attempt);
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function recomputeAllUserStats() {
  const users = await User.find({});
  const bulk = [];
  for (const user of users) {
    const attempts = await QuizAttempt.find({ user: user._id });
    if (attempts.length === 0) continue;
    const totalQuizzes = attempts.length;
    const totalCorrect = Math.round(attempts.reduce((s, a) => {
      const mcq = (a.answers || []).reduce((sum, ans) => {
        if (ans.isCorrect === null || ans.isCorrect === undefined) return sum;
        return sum + (ans.marksAwarded ?? (ans.isCorrect ? 1 : 0));
      }, 0);
      const subj = (a.answers || []).reduce((sum, ans) => {
        if (ans.isCorrect !== null && ans.isCorrect !== undefined) return sum;
        return sum + (ans.marksAwarded ?? 0);
      }, 0);
      const totalScore = Math.min(mcq + subj, a.totalQuestions || 0);
      return s + totalScore;
    }, 0) * 10) / 10;
    const totalAttempted = attempts.reduce((s, a) => s + (a.totalQuestions || 0), 0);
    const averageScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const acc = averageScore;
    const tq = totalQuizzes;
    let rating = 0;
    if (acc >= 90 && tq >= 20) rating = 5;
    else if (acc >= 75 && tq >= 10) rating = 4;
    else if (acc >= 60 && tq >= 5) rating = 3;
    else if (acc >= 40 && tq >= 3) rating = 2;
    else if (acc >= 20 && tq >= 1) rating = 1;
    bulk.push({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            'quizStats.totalQuizzes': totalQuizzes,
            'quizStats.totalCorrect': totalCorrect,
            'quizStats.totalAttempted': totalAttempted,
            'quizStats.averageScore': averageScore,
            'quizStats.rating': rating
          }
        }
      }
    });
  }
  if (bulk.length > 0) await User.bulkWrite(bulk);
}

const migrateAttempts = async (req, res) => {
  try {
    const batchSize = 10;

    const needsMigration = await QuizAttempt.countDocuments({
      'answers': {
        $elemMatch: {
          'aiEvaluated': { $ne: true }
        }
      }
    });

    if (needsMigration === 0) {
      await recomputeAllUserStats();
      return res.json({ processed: 0, remaining: 0, total: 0, message: 'All attempts up to date. Stats recomputed.' });
    }

    const attempts = await QuizAttempt.find({
      'answers': {
        $elemMatch: {
          'aiEvaluated': { $ne: true }
        }
      }
    })
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer expectedAnswer type questionType difficulty explanation'
      })
      .limit(batchSize);

    let processed = 0;
    for (const attempt of attempts) {
      const changed = await evaluateAttemptSubjective(attempt);
      if (changed) processed++;
    }

    const remaining = await QuizAttempt.countDocuments({
      'answers': {
        $elemMatch: {
          'aiEvaluated': { $ne: true }
        }
      }
    });

    if (remaining === 0) {
      await recomputeAllUserStats();
    }

    res.json({
      processed,
      remaining,
      total: needsMigration,
      finalBatch: remaining === 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ 'quizStats.totalQuizzes': { $gt: 0 } })
      .select('name avatar quizStats college')
      .sort('-quizStats.totalCorrect -quizStats.averageScore -quizStats.totalQuizzes')
      .limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuestions, getQuestionsForQuiz, getQuestionById, createQuestion,
  generateQuestions, generateSubjectQuizController, submitQuiz,
  getAttempts, getAttemptById, migrateAttempts, getLeaderboard
};