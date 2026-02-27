import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { IndentSize } from '../../types';
import {
  Minimize2,
  Trash2,
  FileCode,
  Moon,
  Sun,
  AlignLeft,
  Wand2,
  X,
  ArrowRightLeft,
  FileText,
  Layers
} from 'lucide-react';

export function Toolbar() {
  const {
    indentSize,
    isDark,
    error,
    input,
    setIndentSize,
    toggleTheme,
    format,
    minify,
    escape,
    unescape,
    minifyAndEscape,
    clear,
    loadExample,
    fix
  } = useAppStore();

  const [fixMessage, setFixMessage] = useState<string | null>(null);

  const handleFix = () => {
    const result = fix();
    setFixMessage(result.message);
    // 3秒后清除提示
    setTimeout(() => setFixMessage(null), 5000);
  };

  const indentOptions: { value: IndentSize; label: string }[] = [
    { value: 2, label: '2 空格' },
    { value: 4, label: '4 空格' },
    { value: 8, label: '8 空格' }
  ];

  const hasErrors = error && input.trim();

  return (
    <div className="relative">
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        isDark
          ? 'bg-slate-800/60 border-slate-700/50'
          : 'bg-white/60 border-emerald-100/60'
      } backdrop-blur-sm`}>
        {/* Left: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={format}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow-md ${
              isDark
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white'
            }`}
          >
            <AlignLeft size={18} />
            <span>格式化</span>
          </button>

          <button
            onClick={minify}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow-md ${
              isDark
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white'
                : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white'
            }`}
          >
            <Minimize2 size={18} />
            <span>压缩</span>
          </button>

          <button
            onClick={minifyAndEscape}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow-md ${
              isDark
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white'
                : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white'
            }`}
            title="先压缩再转义 JSON"
          >
            <Layers size={18} />
            <span>压缩转义</span>
          </button>

          <button
            onClick={escape}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow-md ${
              isDark
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white'
            }`}
            title="将 JSON 转义为字符串形式"
          >
            <FileText size={18} />
            <span>转义</span>
          </button>

          <button
            onClick={unescape}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow-md ${
              isDark
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white'
            }`}
            title="将转义的 JSON 字符串还原"
          >
            <ArrowRightLeft size={18} />
            <span>去转义</span>
          </button>

          {/* 修复按钮 - 只在有错误时显示 */}
          {hasErrors && (
            <button
              onClick={handleFix}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md animate-pulse"
              title="自动修复 JSON 错误"
            >
              <Wand2 size={18} />
              <span>修复</span>
            </button>
          )}

          <div className={`w-px h-6 mx-2 ${isDark ? 'bg-slate-600' : 'bg-emerald-200'}`} />

          <button
            onClick={clear}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-700/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
            }`}
          >
            <Trash2 size={18} />
            <span>清空</span>
          </button>

          <button
            onClick={loadExample}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-700/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
            }`}
          >
            <FileCode size={18} />
            <span>示例</span>
          </button>
        </div>

      {/* Right: Settings */}
      <div className="flex items-center gap-4">
        {/* Indent Selector */}
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>缩进:</span>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value) as IndentSize)}
            className={`px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
              isDark
                ? 'bg-slate-700/70 text-slate-200 border border-slate-600'
                : 'bg-white/70 text-slate-700 border border-emerald-200'
            }`}
          >
            {indentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-all ${
            isDark
              ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-700/70'
              : 'text-slate-500 hover:text-amber-500 hover:bg-emerald-50'
          }`}
          title={isDark ? '切换到亮色主题' : '切换到暗色主题'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>

    {/* 修复结果提示消息 */}
    {fixMessage && (
      <div className={`absolute top-full left-5 right-5 mt-2 p-3 rounded-xl shadow-lg z-50 flex items-center justify-between backdrop-blur-sm ${
        fixMessage.includes('已修复') && !fixMessage.includes('但仍存在')
          ? isDark ? 'bg-emerald-600/90 text-white' : 'bg-emerald-500/90 text-white'
          : fixMessage.includes('已尝试修复')
            ? isDark ? 'bg-amber-600/90 text-white' : 'bg-amber-500/90 text-white'
            : isDark ? 'bg-rose-600/90 text-white' : 'bg-rose-500/90 text-white'
      }`}>
        <span className="text-sm">{fixMessage}</span>
        <button
          onClick={() => setFixMessage(null)}
          className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    )}
  </div>
  );
}
