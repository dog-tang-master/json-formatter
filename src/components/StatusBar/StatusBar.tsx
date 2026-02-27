import { useAppStore } from '../../store/appStore';
import { CheckCircle, AlertCircle, Type } from 'lucide-react';

export function StatusBar() {
  const { input, error, isDark, fontSize } = useAppStore();

  const inputLength = input.length;
  const lineCount = input.split('\n').length;

  return (
    <div className={`px-5 py-2.5 flex items-center justify-between text-sm border-t ${
      isDark
        ? 'bg-slate-800/60 border-slate-700/50 text-slate-300'
        : 'bg-white/60 border-emerald-100/60 text-slate-600'
    } backdrop-blur-sm`}>
      {/* Left: Status */}
      <div className="flex items-center gap-4">
        {error ? (
          <div className={`flex items-center gap-2 ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>
            <AlertCircle size={16} />
            <span>
              错误: {error.message}
              {error.line && ` (第 ${error.line} 行`}
              {error.column && `, 第 ${error.column} 列)`}
            </span>
          </div>
        ) : input.trim() ? (
          <div className={`flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <CheckCircle size={16} />
            <span>有效的 JSON</span>
          </div>
        ) : (
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
            请输入 JSON 数据
          </span>
        )}
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-4 text-xs">
        <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Type size={12} />
          字体: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{fontSize}px</strong>
        </span>
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          字符: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{inputLength}</strong>
        </span>
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          行数: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{lineCount}</strong>
        </span>
      </div>
    </div>
  );
}
