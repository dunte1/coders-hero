import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Extension } from '@codemirror/state';
import type { CodingLanguage } from '@/types/lms';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: CodingLanguage | string;
  readOnly?: boolean;
  height?: string;
  placeholder?: string;
  className?: string;
}

const extensions: Record<string, Extension> = {
  python: python(),
  javascript: javascript(),
};

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  readOnly,
  height,
  placeholder,
  className,
}: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={[extensions[language] ?? extensions.python]}
      theme={oneDark}
      readOnly={readOnly}
      height={height}
      placeholder={placeholder}
      className={cn('overflow-hidden rounded-lg border border-slate-700 text-sm', className)}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        autocompletion: true,
        bracketMatching: true,
        closeBrackets: true,
        indentOnInput: true,
        tabSize: 4,
      }}
    />
  );
}
