import Editor from '@monaco-editor/react';
import { useAppStore } from '../../store/appStore';

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function JsonEditor({ value, onChange, readOnly = false, placeholder }: JsonEditorProps) {
  const { isDark } = useAppStore();

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
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
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
