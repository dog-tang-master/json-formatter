# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based JSON formatting tool with a split-pane editor interface. Features include JSON formatting, minification, validation, and theme switching.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **State Management**: Zustand 5
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React

## Common Commands

```bash
# Development server
npm run dev

# Build for production (includes TypeScript check)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### State Management (Zustand)

State is centralized in [src/store/appStore.ts](src/store/appStore.ts):

- **Input/Output**: `input` (raw JSON), `output` (formatted result)
- **Configuration**: `indentSize` (2/4/8), `theme` ('dark'|'light'), `isDark`
- **Error Handling**: `error` object with line/column position info
- **Actions**: `format()`, `minify()`, `clear()`, `loadExample()`, `setInput()`, `setIndentSize()`, `toggleTheme()`

The store performs real-time validation on input changes and automatically reformats output when indent size changes.

### JSON Processing

Core logic in [src/utils/jsonFormatter.ts](src/utils/jsonFormatter.ts):

- `JsonFormatter.format(json, options)` - Pretty prints with configurable indent
- `JsonFormatter.minify(json)` - Removes whitespace
- `JsonFormatter.validate(json)` - Returns validation result with error position (line/column)

Error messages are localized to Chinese with friendly descriptions for common syntax errors.

### Component Structure

Components are feature-organized under [src/components/](src/components/):

- **Editor/JsonEditor.tsx**: Monaco Editor wrapper with theme support
- **Toolbar/Toolbar.tsx**: Action buttons (format, minify, clear, example) and settings (indent, theme)
- **Header/Header.tsx**: App title and GitHub link
- **StatusBar/StatusBar.tsx**: Validation status and character/line counts

### Type System

Types defined in [src/types/index.ts](src/types/index.ts):

- `FormatOptions`: `{ indent, sortKeys, escapeUnicode }`
- `ValidationResult`: `{ valid, error? }`
- `JsonError`: `{ message, line?, column?, position? }`
- `IndentSize`: 2 | 4 | 8
- `Theme`: 'light' | 'dark'

### UI Localization

All user-facing text is in Chinese:
- "输入" / "输出" - Input/Output panel labels
- "格式化" - Format button
- "压缩" - Minify button
- "清空" - Clear button
- "示例" - Load example button
- "缩进" - Indent selector label
- Error messages in `JsonFormatter.getFriendlyErrorMessage()`

## Configuration Files

- [vite.config.ts](vite.config.ts): Basic Vite + React plugin setup
- [tsconfig.app.json](tsconfig.app.json): Strict TypeScript with ES2022/DOM libs
- [eslint.config.js](eslint.config.js): ESLint flat config with TypeScript, React Hooks, and React Refresh
- [tailwind.config.js](tailwind.config.js): Standard Tailwind with content paths for src/**/*.{js,ts,jsx,tsx}
