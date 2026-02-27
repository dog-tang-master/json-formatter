import { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { useAppStore } from '../../store/appStore';
import { JsonFormatter } from '../../utils/jsonFormatter';

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  showErrors?: boolean;
}

const DEFAULT_FONT_SIZE = 14;

export function JsonEditor({ value, onChange, readOnly = false, placeholder, showErrors = false }: JsonEditorProps) {
  const { isDark, setFontSize: setStoreFontSize } = useAppStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // 配置 JSON 诊断选项
    monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [],
      enableSchemaRequest: false,
    });

    // 添加 Ctrl+0 重置字体大小
    editor.addAction({
      id: 'reset-font-size',
      label: '重置字体大小',
      keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Digit0],
      run: () => {
        editor.updateOptions({ fontSize: DEFAULT_FONT_SIZE });
        setStoreFontSize(DEFAULT_FONT_SIZE);
        return;
      }
    });

    // 监听字体大小变化并同步到 store
    editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(monacoInstance.editor.EditorOption.fontSize)) {
        const newFontSize = editor.getOption(monacoInstance.editor.EditorOption.fontSize);
        setStoreFontSize(newFontSize);
      }
    });
  };

  // 当输入内容变化时更新错误标记
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !showErrors || readOnly) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) return;

    // 检测所有错误
    const errors = JsonFormatter.detectErrors(value);

    // 转换为 Monaco 标记
    const markers: monaco.editor.IMarkerData[] = errors.map(error => ({
      severity: monacoRef.current!.MarkerSeverity.Error,
      message: error.message,
      startLineNumber: error.line || 1,
      startColumn: error.column || 1,
      endLineNumber: error.line || 1,
      endColumn: error.column ? error.column + 1 : 2,
      source: 'JSON Validator'
    }));

    // 设置模型标记（这会在编辑器中显示红色波浪线）
    monacoRef.current.editor.setModelMarkers(model, 'json-validator', markers);

    // 清理函数
    return () => {
      if (model && monacoRef.current) {
        monacoRef.current.editor.setModelMarkers(model, 'json-validator', []);
      }
    };
  }, [value, showErrors, readOnly]);

  const handleChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        defaultLanguage="json"
        value={value}
        onChange={handleChange}
        theme={isDark ? 'vs-dark' : 'light'}
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: DEFAULT_FONT_SIZE,
          mouseWheelZoom: true,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          hover: {
            enabled: true,
            sticky: true,
          },
        }}
      />
      {!value && placeholder && (
        <div className="absolute top-4 left-14 text-gray-500 pointer-events-none select-none text-sm">
          {placeholder}
        </div>
      )}
    </div>
  );
}
