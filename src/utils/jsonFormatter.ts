import type { FormatOptions, ValidationResult, JsonError } from '../types';

export class JsonFormatter {
  /**
   * 格式化 JSON（美化）
   */
  static format(json: string, options: FormatOptions): string {
    const parsed = JSON.parse(json);

    if (options.sortKeys) {
      return JSON.stringify(parsed, this.sortReplacer, options.indent);
    }

    return JSON.stringify(parsed, null, options.indent);
  }

  /**
   * 压缩 JSON
   */
  static minify(json: string): string {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  }

  /**
   * 验证 JSON 语法
   */
  static validate(json: string): ValidationResult {
    if (!json.trim()) {
      return {
        valid: false,
        error: {
          message: 'JSON 不能为空',
          line: 1,
          column: 1,
          position: 0
        }
      };
    }

    try {
      JSON.parse(json);
      return { valid: true };
    } catch (e) {
      const error = e as SyntaxError;
      return {
        valid: false,
        error: this.parseError(error, json)
      };
    }
  }

  /**
   * 解析错误信息
   */
  private static parseError(error: SyntaxError, json: string): JsonError {
    const message = error.message;
    const match = message.match(/position\s+(\d+)/);
    const position = match ? parseInt(match[1], 10) : undefined;

    if (position !== undefined) {
      const { line, column } = this.getLineAndColumn(json, position);
      return {
        message: this.getFriendlyErrorMessage(message),
        line,
        column,
        position
      };
    }

    return {
      message: this.getFriendlyErrorMessage(message)
    };
  }

  /**
   * 获取行号和列号
   */
  private static getLineAndColumn(json: string, position: number): { line: number; column: number } {
    let line = 1;
    let column = 1;

    for (let i = 0; i < position && i < json.length; i++) {
      if (json[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return { line, column };
  }

  /**
   * 获取友好的错误信息
   */
  private static getFriendlyErrorMessage(message: string): string {
    if (message.includes('Unexpected token')) {
      return '意外的字符，请检查 JSON 语法';
    }
    if (message.includes('Unexpected end')) {
      return 'JSON 未完整结束，可能缺少闭合括号';
    }
    if (message.includes('Unexpected string')) {
      return '意外的字符串，可能缺少逗号或冒号';
    }
    if (message.includes('Unexpected number')) {
      return '意外的数字，请检查键名是否加引号';
    }
    return message;
  }

  /**
   * 排序键名的 replacer 函数
   */
  private static sortReplacer(_key: string, value: unknown): unknown {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce((sorted, k) => {
        sorted[k] = (value as Record<string, unknown>)[k];
        return sorted;
      }, {} as Record<string, unknown>);
    }
    return value;
  }
}

export const defaultFormatOptions: FormatOptions = {
  indent: 2,
  sortKeys: false,
  escapeUnicode: false
};
