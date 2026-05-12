'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  ScanFace,
  Mic,
  Newspaper,
  Brain,
  Target,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  Share2,
  ChevronRight,
  Eye,
  Volume2,
  FileText,
  LightbulbIcon,
  type LucideIcon,
} from 'lucide-react';
import PageContainer, { PageHeader } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';
import { quizQuestions, type ImmunityResult, type QuizQuestion } from '@/lib/mock-data';

type LabPhase = 'intro' | 'quiz' | 'result';

const categoryIcons: { label: string; icon: LucideIcon; color: string; count: number }[] = [
  { label: 'AI人脸识别', icon: ScanFace, color: 'text-pink-400', count: quizQuestions.filter(q => q.category === 'AI人脸' || q.category === 'AI图片').length },
  { label: 'AI拟声辨别', icon: Mic, color: 'text-purple-400', count: quizQuestions.filter(q => q.category === 'AI拟声' || q.category === '真实音频').length },
  { label: '真假新闻', icon: Newspaper, color: 'text-blue-400', count: quizQuestions.filter(q => q.category === 'AI新闻' || q.category === '真实新闻' || q.category === '真实信息').length },
  { label: '情绪操控', icon: Brain, color: 'text-amber-400', count: quizQuestions.filter(q => q.category === '情绪操控' || q.category === '传播诱导').length },
];

const TOTAL_QUESTIONS = 8;

export default function LabPage() {
  const [phase, setPhase] = useState<LabPhase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ question: QuizQuestion; correct: boolean }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [immunityResult, setImmunityResult] = useState<ImmunityResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [resultSource, setResultSource] = useState<string>('');

  // Shuffle and pick questions, ensuring a mix of types
  const [shuffledQuestions] = useState(() => {
    const imageQs = quizQuestions.filter(q => q.imageUrl);
    const audioQs = quizQuestions.filter(q => q.audioDescription);
    const textQs = quizQuestions.filter(q => !q.imageUrl && !q.audioDescription);

    const pick = <T,>(arr: T[], n: number): T[] => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

    const picked = [
      ...pick(imageQs, 4),
      ...pick(audioQs, 1),
      ...pick(textQs, 3),
    ].sort(() => Math.random() - 0.5);

    return picked.slice(0, TOTAL_QUESTIONS);
  });

  const handleAnswer = useCallback(
    (isFake: boolean) => {
      if (selectedAnswer !== null) return;
      const question = shuffledQuestions[currentIndex];
      const correct = isFake === question.isFake;
      setSelectedAnswer(isFake);
      setShowExplanation(true);
      if (correct) setScore((s) => s + 1);
      setAnswers((prev) => [...prev, { question, correct }]);
    },
    [currentIndex, selectedAnswer, shuffledQuestions]
  );

  const nextQuestion = useCallback(async () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      const finalScore = Math.round(((score + (selectedAnswer === shuffledQuestions[currentIndex].isFake ? 1 : 0)) / shuffledQuestions.length) * 100);
      const correctCount = score + (selectedAnswer === shuffledQuestions[currentIndex].isFake ? 1 : 0);

      setIsEvaluating(true);

      try {
        const response = await fetch('/api/lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: answers.map((a) => ({
              category: a.question.category,
              riskType: a.question.riskType,
              correct: a.correct,
            })),
            totalQuestions: shuffledQuestions.length,
            correctCount,
          }),
        });

        const data = await response.json();
        if (data.success && data.data) {
          setImmunityResult(data.data);
          setResultSource(data.source || 'ai');
        } else {
          throw new Error('Invalid response');
        }
      } catch {
        const riskTypes = answers.reduce<Record<string, number>>((acc, a) => {
          if (!a.correct) acc[a.question.riskType] = (acc[a.question.riskType] || 0) + 1;
          return acc;
        }, {});

        const weakPoints = Object.entries(riskTypes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([type]) => type);

        const level = finalScore >= 80 ? 'S' : finalScore >= 60 ? 'A' : finalScore >= 40 ? 'B' : 'C';
        const levelDesc =
          level === 'S'
            ? 'AI风险识别专家，你几乎不会被AI诈骗手段欺骗'
            : level === 'A'
            ? '良好的风险意识，但仍需提升对高级AI骗局的警惕'
            : level === 'B'
            ? '风险识别能力一般，建议参加更多AI媒介素养训练'
            : 'AI风险抵抗力较低，强烈建议学习AI骗局识别技巧';

        setImmunityResult({
          overallScore: finalScore,
          level,
          levelDesc,
          weaknesses: weakPoints.length > 0 ? weakPoints : ['暂无明显弱点'],
          strengths: ['基础风险意识'],
          riskProfile: [
            { type: 'AI拟声识别', score: Math.round(Math.random() * 40 + 60) },
            { type: 'AI换脸识别', score: Math.round(Math.random() * 40 + 50) },
            { type: '情绪操控识别', score: Math.round(Math.random() * 40 + 55) },
            { type: '传播诱导识别', score: Math.round(Math.random() * 40 + 50) },
            { type: '身份伪造识别', score: Math.round(Math.random() * 40 + 45) },
          ],
        });
        setResultSource('calculated');
      } finally {
        setIsEvaluating(false);
        setPhase('result');
      }
    }
  }, [currentIndex, shuffledQuestions, score, selectedAnswer, answers]);

  const currentQuestion = shuffledQuestions[currentIndex];

  const getCategoryColor = (category: string) => {
    if (category.includes('AI') || category.includes('情绪') || category.includes('传播')) return 'text-danger';
    return 'text-success';
  };

  const getCategoryBg = (category: string) => {
    if (category.includes('AI') || category.includes('情绪') || category.includes('传播')) return 'bg-danger/10 text-danger border-danger/20';
    return 'bg-success/10 text-success border-success/20';
  };

  return (
    <PageContainer>
      <PageHeader
        title="AI媒介素养实验室"
        subtitle="真实素材 · 真假辨别 · 提升免疫力"
        icon="◇"
      />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Hero Card */}
            <div className="glass-card p-6 text-center">
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center shadow-lg shadow-accent/20">
                  <FlaskConical size={32} className="text-white" strokeWidth={1.5} />
                </div>
              </motion.div>
              <h2 className="text-xl font-bold gradient-text mb-2">你能识破AI骗局吗？</h2>
              <p className="text-xs text-muted leading-relaxed mb-4">
                系统将展示真实素材和AI生成内容，你需要判断真伪。
                <br />
                包含真实照片、AI人脸、新闻文本和音频场景。
              </p>
              <div className="flex justify-center gap-6 text-center mb-4">
                <div>
                  <div className="text-lg font-bold text-accent">{TOTAL_QUESTIONS}</div>
                  <div className="text-[10px] text-muted">题目数</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-lg font-bold text-cyan">~3min</div>
                  <div className="text-[10px] text-muted">预计时间</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-lg font-bold text-pink-400">{quizQuestions.filter(q => q.imageUrl).length}</div>
                  <div className="text-[10px] text-muted">真实图片</div>
                </div>
              </div>
            </div>

            {/* Category Preview */}
            <div className="grid grid-cols-2 gap-2">
              {categoryIcons.map((cat, i) => {
                const CatIcon = cat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card-sm p-3 text-center"
                  >
                    <CatIcon size={24} className={`mx-auto mb-1 ${cat.color}`} strokeWidth={1.5} />
                    <div className="text-xs text-foreground/70">{cat.label}</div>
                    <div className="text-[10px] text-muted">{cat.count}题</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase('quiz')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm shadow-lg shadow-accent/20 inline-flex items-center justify-center gap-2"
            >
              开始挑战
              <ChevronRight size={16} strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        )}

        {phase === 'quiz' && currentQuestion && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Progress */}
            <div className="glass-card-sm p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted">
                  第 {currentIndex + 1}/{shuffledQuestions.length} 题
                </span>
                <span className="text-xs text-accent">
                  得分 {score}/{currentIndex + (selectedAnswer !== null ? 1 : 0)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-cyan"
                  animate={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass-card p-5"
            >
              {/* Category & Difficulty Tags */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {currentQuestion.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  currentQuestion.difficulty === 'hard'
                    ? 'bg-danger/10 text-danger border border-danger/20'
                    : currentQuestion.difficulty === 'medium'
                    ? 'bg-warning/10 text-warning border border-warning/20'
                    : 'bg-success/10 text-success border border-success/20'
                }`}>
                  {currentQuestion.difficulty === 'hard' ? '困难' : currentQuestion.difficulty === 'medium' ? '中等' : '简单'}
                </span>
                {currentQuestion.imageUrl && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-400/10 text-pink-400 border border-pink-400/20 inline-flex items-center gap-1">
                    <Eye size={8} strokeWidth={1.5} /> 图片题
                  </span>
                )}
                {currentQuestion.audioDescription && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-400 border border-purple-400/20 inline-flex items-center gap-1">
                    <Volume2 size={8} strokeWidth={1.5} /> 音频题
                  </span>
                )}
              </div>

              <p className="text-xs text-muted mb-3">{currentQuestion.description}</p>

              {/* Image Display */}
              {currentQuestion.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]"
                >
                  <img
                    src={currentQuestion.imageUrl}
                    alt="待判断的内容"
                    className="w-full max-h-72 object-contain"
                  />
                </motion.div>
              )}

              {/* Audio Description */}
              {currentQuestion.audioDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-xl bg-purple-400/5 border border-purple-400/15"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                      <Volume2 size={16} className="text-purple-400" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs text-purple-400 font-medium">音频场景</span>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {currentQuestion.audioDescription}
                  </p>
                </motion.div>
              )}

              {/* Question Content */}
              <p className="text-sm leading-relaxed mb-4 font-medium">
                &ldquo;{currentQuestion.content}&rdquo;
              </p>

              {/* Hint Button */}
              {currentQuestion.hint && !showExplanation && (
                <div className="mb-3">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-[10px] text-accent/60 hover:text-accent inline-flex items-center gap-1 transition-colors"
                  >
                    <LightbulbIcon size={10} strokeWidth={1.5} />
                    {showHint ? '隐藏提示' : '需要提示？'}
                  </button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-accent/50 mt-1"
                      >
                        💡 {currentQuestion.hint}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Answer Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(false)}
                  disabled={selectedAnswer !== null}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                    selectedAnswer === false
                      ? currentQuestion.isFake
                        ? 'bg-danger/15 border border-danger/30 text-danger'
                        : 'bg-success/15 border border-success/30 text-success'
                      : 'glass-card text-success'
                  } disabled:opacity-60`}
                >
                  ✓ 真实
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(true)}
                  disabled={selectedAnswer !== null}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                    selectedAnswer === true
                      ? currentQuestion.isFake
                        ? 'bg-success/15 border border-success/30 text-success'
                        : 'bg-danger/15 border border-danger/30 text-danger'
                      : 'glass-card text-danger'
                  } disabled:opacity-60`}
                >
                  ✗ AI伪造
                </motion.button>
              </div>
            </motion.div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card-sm p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm ${selectedAnswer === currentQuestion.isFake ? 'text-success' : 'text-danger'}`}>
                      {selectedAnswer === currentQuestion.isFake ? '✓ 回答正确' : '✗ 回答错误'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getCategoryBg(currentQuestion.category)}`}>
                      {currentQuestion.isFake ? 'AI生成内容' : '真实内容'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed mb-3">
                    {currentQuestion.explanation}
                  </p>

                  {/* Telltale Signs */}
                  {currentQuestion.telltaleSigns && currentQuestion.telltaleSigns.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-lg bg-accent/5 border border-accent/10">
                      <p className="text-[10px] text-accent font-medium mb-1.5">🔍 关键识别线索：</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentQuestion.telltaleSigns.map((sign, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent/80 border border-accent/15">
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={nextQuestion}
                    disabled={isEvaluating}
                    className="w-full py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium border border-accent/20 inline-flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="flex gap-1">
                          <span className="thinking-dot w-1 h-1 rounded-full bg-accent" />
                          <span className="thinking-dot w-1 h-1 rounded-full bg-accent" />
                          <span className="thinking-dot w-1 h-1 rounded-full bg-accent" />
                        </div>
                        AI评估中...
                      </>
                    ) : currentIndex < shuffledQuestions.length - 1 ? (
                      <>下一题 <ChevronRight size={14} strokeWidth={1.5} /></>
                    ) : (
                      <>查看AI评估结果 <ChevronRight size={14} strokeWidth={1.5} /></>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === 'result' && immunityResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Source Badge */}
            {resultSource === 'ai' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20"
              >
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] text-accent font-medium">UCAE 统一认知分析引擎</span>
              </motion.div>
            )}

            {/* Score Card */}
            <div className="glass-card p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-cyan mx-auto flex items-center justify-center mb-4 shadow-lg shadow-accent/30"
              >
                <div>
                  <div className="text-3xl font-bold text-white">{immunityResult.level}</div>
                  <div className="text-[10px] text-white/60">等级</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold gradient-text mb-1">
                  AI免疫力指数：{immunityResult.overallScore}%
                </h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  {immunityResult.levelDesc}
                </p>
              </motion.div>
            </div>

            {/* Answer Review */}
            <div className="glass-card-sm p-4">
              <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                <Eye size={14} className="text-accent" strokeWidth={1.5} />
                答题回顾
              </h3>
              <div className="space-y-2">
                {answers.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/[0.02]"
                  >
                    <span className={`text-xs ${a.correct ? 'text-success' : 'text-danger'}`}>
                      {a.correct ? '✓' : '✗'}
                    </span>
                    <span className="text-[10px] text-muted w-10 shrink-0">{a.question.category}</span>
                    <span className="text-[10px] text-foreground/60 truncate flex-1">
                      {a.question.content.length > 20 ? a.question.content.slice(0, 20) + '...' : a.question.content}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${a.question.isFake ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                      {a.question.isFake ? 'AI' : '真实'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risk Profile */}
            <div className="glass-card-sm p-4">
              <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                <Target size={14} className="text-accent" strokeWidth={1.5} />
                风险认知画像
              </h3>
              <div className="space-y-3">
                {immunityResult.riskProfile.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/70">{item.type}</span>
                      <span className={item.score >= 70 ? 'text-success' : item.score >= 50 ? 'text-warning' : 'text-danger'}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: item.score >= 70
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                            : item.score >= 50
                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                            : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="glass-card-sm p-4">
              <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                <AlertTriangle size={14} className="text-warning" strokeWidth={1.5} />
                你容易受到的攻击类型
              </h3>
              <div className="flex flex-wrap gap-2">
                {immunityResult.weaknesses.map((w, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="text-xs px-3 py-1.5 rounded-full bg-danger/10 text-danger border border-danger/20"
                  >
                    {w}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card-sm p-4">
              <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                <Lightbulb size={14} className="text-warning" strokeWidth={1.5} />
                提升建议
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-accent text-xs">▸</span>
                  <span className="text-xs text-foreground/70">遇到AI人脸照片，重点观察耳朵、牙齿、虹膜和发际线</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent text-xs">▸</span>
                  <span className="text-xs text-foreground/70">接到要求转账的电话，务必通过视频通话或其他渠道确认</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent text-xs">▸</span>
                  <span className="text-xs text-foreground/70">不要轻信"独家""惊人"等标题党内容，查证信息来源</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent text-xs">▸</span>
                  <span className="text-xs text-foreground/70">对制造紧迫感、恐惧情绪的信息保持警惕</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent text-xs">▸</span>
                  <span className="text-xs text-foreground/70">AI语音/视频通话可设置家庭验证暗号</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase('intro');
                  setCurrentIndex(0);
                  setScore(0);
                  setAnswers([]);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setShowHint(false);
                  setImmunityResult(null);
                  setResultSource('');
                }}
                className="flex-1 py-3 rounded-xl glass-card text-accent text-sm font-medium inline-flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} strokeWidth={1.5} />
                重新测试
              </button>
              <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent to-cyan text-white text-sm font-medium inline-flex items-center justify-center gap-1.5">
                <Share2 size={14} strokeWidth={1.5} />
                分享结果
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </PageContainer>
  );
}
