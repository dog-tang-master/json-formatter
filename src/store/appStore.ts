import { create } from 'zustand';
import type { JsonError, IndentSize, Theme } from '../types';
import { JsonFormatter, defaultFormatOptions } from '../utils/jsonFormatter';

interface AppState {
  // 输入输出状态
  input: string;
  output: string;

  // 配置状态
  indentSize: IndentSize;
  theme: Theme;
  isDark: boolean;

  // 错误状态
  error: JsonError | null;

  // 操作方法
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  setIndentSize: (size: IndentSize) => void;
  toggleTheme: () => void;

  // JSON 操作
  format: () => void;
  minify: () => void;
  clear: () => void;
  loadExample: () => void;
}

const exampleJson = JSON.stringify({
  "name": "JSON Formatter",
  "version": "1.0.0",
  "description": "A powerful JSON formatting tool",
  "features": ["Format", "Minify", "Validate"],
  "config": {
    "indent": 2,
    "theme": "dark",
    "autocomplete": true
  },
  "author": {
    "name": "Developer",
    "email": "dev@example.com"
  }
}, null, 2);

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  input: '',
  output: '',
  indentSize: 2,
  theme: 'dark',
  isDark: true,
  error: null,

  // 设置输入
  setInput: (value: string) => {
    set({ input: value });
    // 实时验证
    const result = JsonFormatter.validate(value);
    set({ error: result.error || null });
  },

  // 设置输出
  setOutput: (value: string) => set({ output: value }),

  // 设置缩进大小
  setIndentSize: (size: IndentSize) => {
    set({ indentSize: size });
    // 如果已有输出，重新格式化
    const { input, output } = get();
    if (input && output) {
      get().format();
    }
  },

  // 切换主题
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({
      theme: newTheme,
      isDark: newTheme === 'dark'
    });
  },

  // 格式化 JSON
  format: () => {
    const { input, indentSize } = get();
    if (!input.trim()) return;

    const validation = JsonFormatter.validate(input);
    if (!validation.valid) {
      set({ error: validation.error });
      return;
    }

    try {
      const formatted = JsonFormatter.format(input, {
        ...defaultFormatOptions,
        indent: indentSize
      });
      set({ output: formatted, error: null });
    } catch (e) {
      set({
        error: {
          message: e instanceof Error ? e.message : '格式化失败'
        }
      });
    }
  },

  // 压缩 JSON
  minify: () => {
    const { input } = get();
    if (!input.trim()) return;

    const validation = JsonFormatter.validate(input);
    if (!validation.valid) {
      set({ error: validation.error });
      return;
    }

    try {
      const minified = JsonFormatter.minify(input);
      set({ output: minified, error: null });
    } catch (e) {
      set({
        error: {
          message: e instanceof Error ? e.message : '压缩失败'
        }
      });
    }
  },

  // 清空
  clear: () => {
    set({ input: '', output: '', error: null });
  },

  // 加载示例
  loadExample: () => {
    set({ input: exampleJson, error: null });
    const formatted = JsonFormatter.format(exampleJson, {
      ...defaultFormatOptions,
      indent: 2
    });
    set({ output: formatted });
  }
}));
