export interface FormatOptions {
  indent: number;
  sortKeys: boolean;
  escapeUnicode: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: JsonError;
}

export interface JsonError {
  message: string;
  line?: number;
  column?: number;
  position?: number;
}

export interface JsonFixSuggestion {
  type: 'single_quote' | 'trailing_comma' | 'missing_comma' | 'unquoted_key' | 'comment' | 'unclosed_bracket' | 'other';
  message: string;
  position: number;
  length: number;
  fix: () => string;
}

export type Theme = 'light' | 'dark';
export type ViewMode = 'text' | 'tree';
export type IndentSize = 2 | 4 | 8;
