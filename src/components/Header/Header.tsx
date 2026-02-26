import { useAppStore } from '../../store/appStore';
import { FileJson, Github } from 'lucide-react';

export function Header() {
  const { isDark } = useAppStore();

  return (
    <header className={`px-4 py-3 flex items-center justify-between border-b ${
      isDark
        ? 'bg-gray-900 border-gray-700 text-white'
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <FileJson className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">JSON Formatter</h1>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            强大的 JSON 格式化工具
          </p>
        </div>
      </div>

      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 rounded-md transition-colors ${
          isDark
            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <Github className="w-5 h-5" />
      </a>
    </header>
  );
}
