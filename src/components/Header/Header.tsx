import { useAppStore } from '../../store/appStore';
import { FileJson } from 'lucide-react';

export function Header() {
  const { isDark } = useAppStore();

  return (
    <header className={`px-6 py-4 flex items-center border-b ${
      isDark
        ? 'bg-slate-900/80 border-slate-700/50 text-white'
        : 'bg-white/80 border-emerald-100/80 text-slate-700'
    } backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl shadow-lg ${
          isDark
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-emerald-400 to-cyan-500'
        }`}>
          <FileJson className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>
            JSON Formatter
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            简洁优雅的 JSON 格式化工具
          </p>
        </div>
      </div>
    </header>
  );
}
