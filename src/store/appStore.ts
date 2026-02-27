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
  fontSize: number;

  // 错误状态
  error: JsonError | null;

  // 操作方法
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  setIndentSize: (size: IndentSize) => void;
  toggleTheme: () => void;
  setFontSize: (size: number) => void;
  resetFontSize: () => void;

  // JSON 操作
  format: () => void;
  minify: () => void;
  clear: () => void;
  loadExample: () => void;
  fix: () => { success: boolean; message: string };
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
  fontSize: 14,
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

  // 设置字体大小
  setFontSize: (size: number) => {
    set({ fontSize: Math.round(size) });
  },

  // 重置字体大小
  resetFontSize: () => set({ fontSize: 14 }),

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
  },

  // 自动修复 JSON 错误
  fix: () => {
    const { input } = get();
    if (!input.trim()) {
      return { success: false, message: '没有可修复的内容' };
    }

    const { result, fixed, changes } = JsonFormatter.fix(input);

    if (changes.length === 0) {
      return { success: false, message: '没有可修复的错误' };
    }

    // 验证修复后的结果
    const validation = JsonFormatter.validate(result);

    if (validation.valid) {
      // 修复成功且 JSON 有效
      set({ input: result, error: null });
      const formatted = JsonFormatter.format(result, {
        ...defaultFormatOptions,
        indent: get().indentSize
      });
      set({ output: formatted });
      return {
        success: true,
        message: `已修复 ${changes.length} 个问题: ${changes.join(', ')}`
      };
    } else if (fixed) {
      // 修复后仍有问题但有所改善
      set({ input: result, error: validation.error || null });
      return {
        success: false,
        message: `已尝试修复 ${changes.length} 个问题，但仍存在错误: ${validation.error?.message || '未知错误'}`
      };
    } else {
      return {
        success: false,
        message: '未能自动修复错误'
      };
    }
  }
}));
