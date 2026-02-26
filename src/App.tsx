import { useAppStore } from './store/appStore';
import { Header } from './components/Header/Header';
import { Toolbar } from './components/Toolbar/Toolbar';
import { JsonEditor } from './components/Editor/JsonEditor';
import { StatusBar } from './components/StatusBar/StatusBar';

function App() {
  const { input, output, setInput, isDark } = useAppStore();

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <Header />

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className={`flex-1 flex flex-col border-r ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`px-4 py-2 text-xs font-medium ${
            isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
          }`}>
            输入
          </div>
          <div className="flex-1">
            <JsonEditor
              value={input}
              onChange={setInput}
              placeholder="在此粘贴 JSON 数据..."
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col">
          <div className={`px-4 py-2 text-xs font-medium ${
            isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
          }`}>
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
