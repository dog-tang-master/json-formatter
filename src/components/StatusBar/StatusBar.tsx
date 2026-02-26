import { useAppStore } from '../../store/appStore';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function StatusBar() {
  const { input, error, isDark } = useAppStore();

  const inputLength = input.length;
  const lineCount = input.split('\n').length;

  return (
    <div className={`px-4 py-2 flex items-center justify-between text-sm border-t ${
      isDark
        ? 'bg-gray-800 border-gray-700 text-gray-300'
        : 'bg-gray-50 border-gray-200 text-gray-600'
    }`}>
      {/* Left: Status */}
      <div className="flex items-center gap-4">
        {error ? (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={16} />
            <span>
              错误: {error.message}
              {error.line && ` (第 ${error.line} 行`}
              {error.column && `, 第 ${error.column} 列)`}
            </span>
          </div>
        ) : input.trim() ? (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={16} />
            <span>有效的 JSON</span>
          </div>
        ) : (
          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
            请输入 JSON 数据
          </span>
        )}
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-4 text-xs">
        <span>
          字符: <strong>{inputLength}</strong>
        </span>
        <span>
          行数: <strong>{lineCount}</strong>
        </span>
      </div>
    </div>
  );
}
