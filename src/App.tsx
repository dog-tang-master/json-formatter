import { useAppStore } from './store/appStore';
import { Header } from './components/Header/Header';
import { Toolbar } from './components/Toolbar/Toolbar';
import { JsonEditor } from './components/Editor/JsonEditor';
import { StatusBar } from './components/StatusBar/StatusBar';

function App() {
  const { input, output, setInput, isDark } = useAppStore();

  return (
    <div className={`h-screen flex flex-col ${
      isDark
        ? 'bg-slate-900'
        : 'bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50'
    }`}>
      {/* Header */}
      <Header />

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Input Panel */}
        <div className={`flex-1 flex flex-col rounded-2xl shadow-lg overflow-hidden border ${
          isDark
            ? 'bg-slate-800/80 border-slate-700/50'
            : 'bg-white/80 border-white/50'
        } backdrop-blur-sm`}>
          <div className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            isDark
              ? 'bg-slate-800/90 text-emerald-400 border-b border-slate-700/50'
              : 'bg-white/90 text-emerald-600 border-b border-emerald-100/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            输入
          </div>
          <div className="flex-1">
            <JsonEditor
              value={input}
              onChange={setInput}
              placeholder="在此粘贴 JSON 数据..."
              showErrors={true}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className={`flex-1 flex flex-col rounded-2xl shadow-lg overflow-hidden border ${
          isDark
            ? 'bg-slate-800/80 border-slate-700/50'
            : 'bg-white/80 border-white/50'
        } backdrop-blur-sm`}>
          <div className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            isDark
              ? 'bg-slate-800/90 text-cyan-400 border-b border-slate-700/50'
              : 'bg-white/90 text-cyan-600 border-b border-cyan-100/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            输出
          </div>
          <div className="flex-1">
            <JsonEditor
              value={output}
              readOnly
              placeholder="格式化后的结果将显示在这里..."
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export default App
