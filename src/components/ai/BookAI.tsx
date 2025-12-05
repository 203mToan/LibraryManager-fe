// ========================================
// FILE 1: services/aiBookService.ts
// ========================================


// ========================================
// FILE 2: components/BookAI.tsx (UPDATED)
// ========================================

import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, Lightbulb } from 'lucide-react';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { motion } from 'framer-motion';
import {
  generateBookSummary,
  chatAboutBook,
  getSuggestedQuestions,
  getCachedSummary,
  cacheSummary
} from '../../service/aiBookService';

interface Book {
  id: string;
  title: string;
  authorId: string;
  categoryId: string;
  isbn: string;
  publisher: string;
  publishYear: number;
  pages: number;
  quantity: number;
  available: number;
  description: string;
  coverUrl: string;
  sumarry: string;
  createdAt: string;
}

interface BookAIProps {
  book: Book;
}

export default function BookAI({ book }: BookAIProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const [summaryStyle, setSummaryStyle] = useState<'brief' | 'detailed' | 'academic'>('brief');
  const [summaryContent, setSummaryContent] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // Load cached summary when style changes
  useEffect(() => {
    const cached = getCachedSummary(book.id, summaryStyle);
    if (cached) {
      setSummaryContent(cached);
    } else {
      setSummaryContent('');
    }
  }, [book.id, summaryStyle]);

  // Load suggested questions when chat tab is opened
  useEffect(() => {
    if (activeTab === 'chat' && suggestedQuestions.length === 0) {
      loadSuggestedQuestions();
    }
  }, [activeTab]);

  const loadSuggestedQuestions = async () => {
    try {
      const questions = await getSuggestedQuestions(book.title);
      setSuggestedQuestions(questions);
    } catch (err) {
      console.error('Failed to load suggested questions:', err);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const summary = await generateBookSummary({
        bookName: book.title,
        bookId: book.id,
        style: summaryStyle
      });

      setSummaryContent(summary);
      cacheSummary(book.id, summaryStyle, summary);
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('Không thể tạo tóm tắt. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || chatInput;
    if (!messageToSend.trim()) return;

    setChatInput('');
    const newUserMessage = { role: 'user' as const, content: messageToSend };
    setChatMessages(prev => [...prev, newUserMessage]);

    setIsGenerating(true);
    setError('');

    try {
      const response = await chatAboutBook({
        bookName: book.title,
        bookId: book.id,
        question: messageToSend,
        conversationHistory: chatMessages
      });

      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Không thể nhận câu trả lời. Vui lòng thử lại.');
      // Remove the user message if failed
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'summary'
            ? 'text-teal-600 border-b-2 border-teal-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Tóm tắt AI
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'chat'
            ? 'text-teal-600 border-b-2 border-teal-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Hỏi đáp
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <Select
              label="Kiểu tóm tắt"
              options={[
                { value: 'brief', label: 'Tóm tắt ngắn' },
                { value: 'detailed', label: 'Tóm tắt chi tiết' },
                { value: 'academic', label: 'Phân tích học thuật' },
              ]}
              value={summaryStyle}
              onChange={(e) => setSummaryStyle(e.target.value as any)}
            />
            <Button onClick={handleGenerateSummary} isLoading={isGenerating}>
              {summaryContent ? 'Tạo lại' : 'Tạo tóm tắt'}
            </Button>
          </div>

          {summaryContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tóm tắt do AI tạo</h3>
                  <p className="text-sm text-gray-600">
                    {summaryStyle === 'brief'
                      ? 'Tổng quan ngắn'
                      : summaryStyle === 'detailed'
                        ? 'Phân tích chi tiết'
                        : 'Góc nhìn học thuật'}
                  </p>
                </div>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{summaryContent}</p>
            </motion.div>
          )}

          {!summaryContent && !isGenerating && (
            <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">Chưa có tóm tắt</p>
              <p className="text-sm mt-1">Nhấn "Tạo tóm tắt" để AI phân tích cuốn sách</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center text-gray-500 mb-6">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Hỏi về nội dung cuốn "{book.title}"</p>
                  <p className="text-sm mt-1">Nhận câu trả lời tức thì do AI hỗ trợ</p>
                </div>

                {suggestedQuestions.length > 0 && (
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Lightbulb className="w-4 h-4" />
                      <span>Câu hỏi gợi ý:</span>
                    </div>
                    {suggestedQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="w-full p-3 text-left text-sm bg-white border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${message.role === 'user'
                      ? 'bg-teal-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))
            )}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleSendMessage()}
              placeholder="Hỏi về nội dung cuốn sách..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isGenerating}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || isGenerating}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
