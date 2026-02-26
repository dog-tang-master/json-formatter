import { useAppStore } from '../../store/appStore';
import type { IndentSize } from '../../types';
import {
  Minimize2,
  Trash2,
  FileCode,
  Moon,
  Sun,
  AlignLeft
} from 'lucide-react';

export function Toolbar() {
  const {
    indentSize,
    isDark,
    setIndentSize,
    toggleTheme,
    format,
    minify,
    clear,
    loadExample
  } = useAppStore();

  const indentOptions: { value: IndentSize; label: string }[] = [
    { value: 2, label: '2 空格' },
    { value: 4, label: '4 空格' },
    { value: 8, label: '8 空格' }
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
      {/* Left: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={format}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
        >
          <AlignLeft size={18} />
          <span>格式化</span>
        </button>

        <button
          onClick={minify}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors font-medium"
        >
          <Minimize2 size={18} />
          <span>压缩</span>
        </button>

        <div className="w-px h-6 bg-gray-600 mx-2" />

        <button
          onClick={clear}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        >
          <Trash2 size={18} />
          <span>清空</span>
        </button>

        <button
          onClick={loadExample}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        >
          <FileCode size={18} />
          <span>示例</span>
        </button>
      </div>

      {/* Right: Settings */}
      <div className="flex items-center gap-4">
        {/* Indent Selector */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">缩进:</span>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value) as IndentSize)}
            className="px-2 py-1.5 bg-gray-700 text-gray-200 rounded-md border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          title={isDark ? '切换到亮色主题' : '切换到暗色主题'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}
