import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as quizService from '../services/quizService';

export const generateQuizQuestions = createAsyncThunk('quiz/generate', async (data, { rejectWithValue }) => {
  try {
    const res = await quizService.generateQuestions(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to generate quiz');
  }
});

export const submitQuizAttempt = createAsyncThunk('quiz/submit', async (data, { rejectWithValue }) => {
  try {
    const res = await quizService.submitQuiz(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit quiz');
  }
});

export const fetchAttempts = createAsyncThunk('quiz/fetchAttempts', async (_, { rejectWithValue }) => {
  try {
    const res = await quizService.getAttempts();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch attempts');
  }
});

export const fetchLeaderboard = createAsyncThunk('quiz/fetchLeaderboard', async (_, { rejectWithValue }) => {
  try {
    const res = await quizService.getLeaderboard();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch leaderboard');
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    currentQuestions: [],
    questionsLoading: false,
    lastResult: null,
    attempts: [],
    attemptsLoading: false,
    leaderboard: [],
    leaderboardLoading: false,
    error: null,
  },
  reducers: {
    clearQuizState: (state) => {
      state.currentQuestions = [];
      state.lastResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuizQuestions.pending, (state) => { state.questionsLoading = true; state.error = null; })
      .addCase(generateQuizQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        state.currentQuestions = action.payload.questions || [];
      })
      .addCase(generateQuizQuestions.rejected, (state, action) => { state.questionsLoading = false; state.error = action.payload; })
      .addCase(submitQuizAttempt.pending, (state) => { state.questionsLoading = true; })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.questionsLoading = false;
        state.lastResult = action.payload;
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => { state.questionsLoading = false; state.error = action.payload; })
      .addCase(fetchAttempts.pending, (state) => { state.attemptsLoading = true; })
      .addCase(fetchAttempts.fulfilled, (state, action) => { state.attemptsLoading = false; state.attempts = action.payload; })
      .addCase(fetchAttempts.rejected, (state, action) => { state.attemptsLoading = false; state.error = action.payload; })
      .addCase(fetchLeaderboard.pending, (state) => { state.leaderboardLoading = true; })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => { state.leaderboardLoading = false; state.leaderboard = action.payload; })
      .addCase(fetchLeaderboard.rejected, (state, action) => { state.leaderboardLoading = false; state.error = action.payload; });
  },
});

export const { clearQuizState } = quizSlice.actions;
export default quizSlice.reducer;
