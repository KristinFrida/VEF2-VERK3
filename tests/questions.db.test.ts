import {
    validateQuestionCreate,
    validateQuestionUpdate
  } from '../src/questions.db'
  
  describe('validateQuestionCreate', () => {
    it('should accept valid question with one correct answer', () => {
      const result = validateQuestionCreate({
        question: 'Test?',
        answer: 'Answer',
        answers: [
          { answer: 'A1', isCorrect: true },
          { answer: 'A2' },
          { answer: 'A3' }
        ]
      })
      expect(result.success).toBe(true)
    })
  
    it('should reject question with two correct answers', () => {
      const result = validateQuestionCreate({
        question: 'Test?',
        answer: 'Answer',
        answers: [
          { answer: 'A1', isCorrect: true },
          { answer: 'A2', isCorrect: true },
        ]
      })
      expect(result.success).toBe(false)
    })
  
    it('should reject question with zero correct answers', () => {
      const result = validateQuestionCreate({
        question: 'Test?',
        answer: 'Answer',
        answers: [
          { answer: 'A1' },
          { answer: 'A2' }
        ]
      })
      expect(result.success).toBe(false)
    })
  })
  
  describe('validateQuestionUpdate', () => {
    it('should accept partial updates', () => {
      const result = validateQuestionUpdate({ question: 'Updated?' })
      expect(result.success).toBe(true)
    })
  })
  