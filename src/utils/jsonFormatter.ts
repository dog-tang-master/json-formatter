import type { FormatOptions, ValidationResult, JsonError, JsonFixSuggestion } from '../types';

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
   * 转义 JSON 字符串
   * 将 JSON 转换为可嵌入字符串的转义形式（不带外层引号）
   * 不改变原始格式，仅对需要转义的字符进行转义
   */
  static escape(json: string): string {
    let result = '';
    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      switch (char) {
        case '"':
          result += '\\"';
          break;
        case '\\':
          result += '\\\\';
          break;
        default:
          result += char;
      }
    }
    return result;
  }

  /**
   * 去转义 JSON 字符串
   * 将转义的 JSON 字符串还原为正常 JSON
   */
  static unescape(escapedJson: string): string {
    let result = '';
    let i = 0;
    while (i < escapedJson.length) {
      const char = escapedJson[i];
      if (char === '\\' && i + 1 < escapedJson.length) {
        const nextChar = escapedJson[i + 1];
        switch (nextChar) {
          case '"':
            result += '"';
            i += 2;
            break;
          case '\\':
            result += '\\';
            i += 2;
            break;
          case 'n':
            result += '\n';
            i += 2;
            break;
          case 'r':
            result += '\r';
            i += 2;
            break;
          case 't':
            result += '\t';
            i += 2;
            break;
          default:
            result += char;
            i++;
        }
      } else {
        result += char;
        i++;
      }
    }
    return result;
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
   * 检测所有错误位置（用于显示多个错误标记）
   */
  static detectErrors(json: string): JsonError[] {
    const errors: JsonError[] = [];

    if (!json.trim()) {
      return errors;
    }

    // 1. 检查单引号（JavaScript 风格，JSON 不允许）
    this.findSingleQuoteErrors(json, errors);

    // 2. 检查尾随逗号
    this.findTrailingCommaErrors(json, errors);

    // 3. 检查未闭合的括号/方括号/花括号
    this.findUnclosedBracketErrors(json, errors);

    // 4. 检查键名未加引号
    this.findUnquotedKeyErrors(json, errors);

    // 5. 检查注释（JSON 不允许注释）
    this.findCommentErrors(json, errors);

    // 6. 使用原生 JSON.parse 检测其他语法错误
    try {
      JSON.parse(json);
    } catch (e) {
      const error = e as SyntaxError;
      const parsedError = this.parseError(error, json);
      // 检查是否已添加过类似位置的错误
      const isDuplicate = errors.some(
        err => err.line === parsedError.line && err.column === parsedError.column
      );
      if (!isDuplicate) {
        errors.push(parsedError);
      }
    }

    return errors.sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  /**
   * 获取修复建议
   */
  static getFixSuggestions(json: string): JsonFixSuggestion[] {
    const suggestions: JsonFixSuggestion[] = [];

    // 1. 单引号改为双引号
    const singleQuotePattern = /'(?:[^'\\]|\\.)*'/g;
    let match: RegExpExecArray | null;
    while ((match = singleQuotePattern.exec(json)) !== null) {
      // 检查是否在字符串内部
      if (!this.isInsideString(json, match.index)) {
        suggestions.push({
          type: 'single_quote',
          message: '将单引号改为双引号',
          position: match.index,
          length: match[0].length,
          fix: () => {
            const content = match![0].slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"');
            return '"' + content + '"';
          }
        });
      }
    }

    // 2. 移除尾随逗号
    const trailingCommaPattern = /,(\s*[}\]])/g;
    while ((match = trailingCommaPattern.exec(json)) !== null) {
      suggestions.push({
        type: 'trailing_comma',
        message: '移除尾随逗号',
        position: match.index,
        length: 1,
        fix: () => ''
      });
    }

    // 3. 修复缺少逗号（键值对之间缺少逗号）
    // 匹配：在字符串、数字、对象或数组结束后，换行或空格，然后直接跟一个键名
    const missingCommaPattern = /([}\]"\d])(\s*)(\n\s*)?("[a-zA-Z_][a-zA-Z0-9_]*"|[a-zA-Z_][a-zA-Z0-9_]*)(\s*):/g;
    while ((match = missingCommaPattern.exec(json)) !== null) {
      const endOfValue = match.index + match[1].length;

      // 检查这个位置是否确实在对象内部，且前面不是开括号
      if (this.isInsideObject(json, endOfValue)) {
        suggestions.push({
          type: 'missing_comma',
          message: '在键值对之间添加缺失的逗号',
          position: endOfValue,
          length: 0,
          fix: () => ','
        });
      }
    }

    // 4. 给未加引号的键名添加引号
    const unquotedKeyPattern = /({|,)(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*):/g;
    while ((match = unquotedKeyPattern.exec(json)) !== null) {
      const key = match[3];
      const keyStart = match.index + match[1].length + match[2].length;
      // 检查是否真的在对象键的位置
      if (!this.isInsideString(json, keyStart) && this.isObjectKey(json, keyStart)) {
        suggestions.push({
          type: 'unquoted_key',
          message: `给键名 "${key}" 添加引号`,
          position: keyStart,
          length: key.length,
          fix: () => `"${key}"`
        });
      }
    }

    // 4. 移除注释
    // 单行注释 //
    const lineCommentPattern = /\/\/.*$/gm;
    while ((match = lineCommentPattern.exec(json)) !== null) {
      suggestions.push({
        type: 'comment',
        message: '移除注释',
        position: match.index,
        length: match[0].length,
        fix: () => ''
      });
    }
    // 多行注释 /* */
    const blockCommentPattern = /\/\*[\s\S]*?\*\//g;
    while ((match = blockCommentPattern.exec(json)) !== null) {
      suggestions.push({
        type: 'comment',
        message: '移除注释',
        position: match.index,
        length: match[0].length,
        fix: () => ''
      });
    }

    // 5. 修复未闭合的括号 - 在末尾添加
    const openBrackets: { char: string; position: number }[] = [];

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      const prevChar = i > 0 ? json[i - 1] : '';

      if (char === '"' && prevChar !== '\\') {
        // 跳过字符串内容
        i++;
        while (i < json.length && !(json[i] === '"' && json[i - 1] !== '\\')) {
          if (json[i] === '\\') i++;
          i++;
        }
        continue;
      }
      if (char === '{' || char === '[') {
        openBrackets.push({ char, position: i });
      } else if (char === '}' || char === ']') {
        const lastOpen = openBrackets.pop();
        if (!lastOpen || (char === '}' && lastOpen.char !== '{') || (char === ']' && lastOpen.char !== '[')) {
          // 多余的闭括号，跳过
        }
      }
    }

    // 未闭合的开括号 - 需要按相反顺序添加闭括号
    const unclosed: string[] = [];
    while (openBrackets.length > 0) {
      const open = openBrackets.pop()!;
      const closeChar = open.char === '{' ? '}' : ']';
      unclosed.push(closeChar);
    }

    // 如果有未闭合的括号，添加一个综合修复建议
    if (unclosed.length > 0) {
      const missing = unclosed.join('');
      suggestions.push({
        type: 'unclosed_bracket',
        message: `添加缺失的闭合括号: ${missing}`,
        position: json.length,
        length: 0,
        fix: () => missing
      });
    }

    return suggestions.sort((a, b) => b.position - a.position); // 从后往前修复
  }

  /**
   * 应用所有自动修复
   */
  static fix(json: string): { result: string; fixed: boolean; changes: string[] } {
    const changes: string[] = [];
    let result = json;

    const suggestions = this.getFixSuggestions(json);

    if (suggestions.length === 0) {
      return { result, fixed: false, changes };
    }

    // 按位置从后往前应用修复，避免位置偏移
    for (const suggestion of suggestions) {
      const before = result;
      const fixedPart = suggestion.fix();
      result = result.slice(0, suggestion.position) + fixedPart + result.slice(suggestion.position + suggestion.length);
      if (before !== result) {
        changes.push(suggestion.message);
      }
    }

    // 验证修复后的结果
    try {
      JSON.parse(result);
      return { result, fixed: true, changes: [...new Set(changes)] };
    } catch {
      // 如果修复后仍然无效，返回部分修复的结果
      return { result, fixed: false, changes: [...new Set(changes)] };
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
   * 查找单引号错误
   */
  private static findSingleQuoteErrors(json: string, errors: JsonError[]): void {
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      const prevChar = i > 0 ? json[i - 1] : '';

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        if (stringChar === "'") {
          // 找到单引号字符串，添加错误
          const startPos = json.lastIndexOf("'", i - 1);
          const { line: startLine, column: startColumn } = this.getLineAndColumn(json, startPos);
          errors.push({
            message: 'JSON 中字符串必须使用双引号',
            line: startLine,
            column: startColumn,
            position: startPos
          });
        }
        inString = false;
        stringChar = '';
      } else if (inString && char === '\\') {
        i++; // 跳过转义字符
      }
    }
  }

  /**
   * 查找尾随逗号错误
   */
  private static findTrailingCommaErrors(json: string, errors: JsonError[]): void {
    const pattern = /,(\s*[}\]])/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(json)) !== null) {
      const { line, column } = this.getLineAndColumn(json, match.index);
      errors.push({
        message: '对象或数组中不允许有尾随逗号',
        line,
        column,
        position: match.index
      });
    }
  }

  /**
   * 查找未闭合的括号错误
   */
  private static findUnclosedBracketErrors(json: string, errors: JsonError[]): void {
    const stack: { char: string; position: number }[] = [];

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      const prevChar = i > 0 ? json[i - 1] : '';

      if (char === '"' && prevChar !== '\\') {
        // 跳过字符串
        i++;
        while (i < json.length && !(json[i] === '"' && json[i - 1] !== '\\')) {
          i++;
        }
        continue;
      }

      if (char === '{' || char === '[') {
        stack.push({ char, position: i });
      } else if (char === '}' || char === ']') {
        const last = stack.pop();
        if (!last) {
          const { line, column } = this.getLineAndColumn(json, i);
          errors.push({
            message: `多余的 ${char}，没有匹配的开启符号`,
            line,
            column,
            position: i
          });
        } else if ((char === '}' && last.char !== '{') || (char === ']' && last.char !== '[')) {
          const { line, column } = this.getLineAndColumn(json, i);
          errors.push({
            message: `括号不匹配，${last.char} 对应 ${last.char === '{' ? '}' : ']'}`,
            line,
            column,
            position: i
          });
        }
      }
    }

    // 未闭合的开括号
    while (stack.length > 0) {
      const unclosed = stack.pop()!;
      const { line, column } = this.getLineAndColumn(json, unclosed.position);
      errors.push({
        message: `${unclosed.char} 未闭合`,
        line,
        column,
        position: unclosed.position
      });
    }
  }

  /**
   * 查找未加引号的键名错误
   */
  private static findUnquotedKeyErrors(json: string, errors: JsonError[]): void {
    const pattern = /({|,)(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*):/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(json)) !== null) {
      const keyStart = match.index + match[1].length + match[2].length;
      const key = match[3];
      if (this.isObjectKey(json, keyStart)) {
        const { line, column } = this.getLineAndColumn(json, keyStart);
        errors.push({
          message: `键名 "${key}" 必须使用双引号包裹`,
          line,
          column,
          position: keyStart
        });
      }
    }
  }

  /**
   * 查找注释错误
   */
  private static findCommentErrors(json: string, errors: JsonError[]): void {
    // 单行注释 //
    const lineCommentPattern = /\/\/.*$/gm;
    let match: RegExpExecArray | null;
    while ((match = lineCommentPattern.exec(json)) !== null) {
      const { line, column } = this.getLineAndColumn(json, match.index);
      errors.push({
        message: 'JSON 不支持单行注释 (//)',
        line,
        column,
        position: match.index
      });
    }

    // 多行注释 /* */
    const blockCommentPattern = /\/\*[\s\S]*?\*\//g;
    while ((match = blockCommentPattern.exec(json)) !== null) {
      const { line, column } = this.getLineAndColumn(json, match.index);
      errors.push({
        message: 'JSON 不支持多行注释 (/* */)',
        line,
        column,
        position: match.index
      });
    }
  }

  /**
   * 检查指定位置是否在字符串内部
   */
  private static isInsideString(json: string, position: number): boolean {
    let inString = false;
    for (let i = 0; i < position; i++) {
      if (json[i] === '"' && (i === 0 || json[i - 1] !== '\\')) {
        inString = !inString;
      } else if (json[i] === '\\' && inString) {
        i++;
      }
    }
    return inString;
  }

  /**
   * 检查指定位置是否为对象键
   */
  private static isObjectKey(json: string, position: number): boolean {
    // 简单检查：向后查找冒号，并且冒号不在字符串内部
    for (let i = position; i < json.length; i++) {
      const char = json[i];
      if (char === ':' && !this.isInsideString(json, i)) {
        return true;
      }
      if (char === ',' || char === '{' || char === '[' || char === '}' || char === ']') {
        return false;
      }
    }
    return false;
  }

  /**
   * 检查指定位置是否在对象内部（而不是数组内部）
   */
  private static isInsideObject(json: string, position: number): boolean {
    let inString = false;
    const stack: string[] = [];

    for (let i = 0; i < position; i++) {
      const char = json[i];
      const prevChar = i > 0 ? json[i - 1] : '';

      if (char === '"' && prevChar !== '\\') {
        inString = !inString;
      } else if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char);
        } else if (char === '}' || char === ']') {
          stack.pop();
        }
      }
    }

    // 如果栈顶是 '{'，说明在对象内部
    return stack.length > 0 && stack[stack.length - 1] === '{';
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
