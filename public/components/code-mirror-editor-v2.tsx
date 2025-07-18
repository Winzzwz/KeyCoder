// NOTE: DO NOT CHANGE ANYTHING ITS... PERFECT!
"use client"

import { useState, useEffect } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { javascript } from "@codemirror/lang-javascript"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"

interface CodeMirrorEditorV2Props {
  initialCode?: string
  language?: string
  onChange?: (code: string) => void
  onLanguageChange?: (language: string) => void
  readOnly?: boolean
  height?: string
  showFooter?: boolean
}

export function CodeMirrorEditorV2({
  initialCode = 'print("Hello World!")',
  language = "python",
  onChange,
  onLanguageChange,
  readOnly,
  height = "400px",
  showFooter = true,
}: CodeMirrorEditorV2Props) {
  const [code, setCode] = useState(initialCode)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [lineCount, setLineCount] = useState(0)

  useEffect(() => {
    if (initialCode !== code) {
      setCode(initialCode)
    }
  }, [initialCode])

  useEffect(() => {
    if (code) {
      const lines = code.split("\n").length
      setLineCount(lines)
    }
  }, [code])

  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case "javascript":
        return javascript()
      case "java":
        return java()
      case "cpp":
        return cpp()
      case "python":
      default:
        return python()
    }
  }

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
    onLanguageChange?.(value)
        const templates: Record<string, string> = {
      python:
        "def solution(input_str):\n    # Your code here\n    return input_str[::-1]  # Example: reverse the string",
      javascript:
        "function solution(inputStr) {\n    // Your code here\n    return inputStr.split('').reverse().join('');\n}",
      java: "public class Solution {\n    public String solution(String inputStr) {\n        // Your code here\n        StringBuilder sb = new StringBuilder(inputStr);\n        return sb.reverse().toString();\n    }\n}",
      cpp: "#include <string>\n\nstd::string solution(std::string inputStr) {\n    // Your code here\n    std::reverse(inputStr.begin(), inputStr.end());\n    return inputStr;\n}",
    }

    if (templates[value]) {
      setCode(templates[value])
      onChange?.(templates[value])
    }
  }

  const handleChange = (value: string) => {
    setCode(value)
    onChange?.(value)
  }

  return (
    <div className="flex flex-col h-full code-editor border border-border/50 rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-secondary/50 p-2 border-b border-border/50">
        <div className="flex items-center space-x-2">
        </div>
      </div>

      <div className="relative flex-grow bg-[#1e1e1e] font-mono text-sm overflow-hidden" style={{ height }}>
        <CodeMirror
          value={code}
          height={height}
          theme={vscodeDark}
          extensions={[getLanguageExtension(selectedLanguage)]}
          onChange={handleChange}
          readOnly={readOnly}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {showFooter && (
        <div className="flex justify-between p-2 bg-secondary/50 rounded-b-md border-t border-border/50">
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Line {lineCount}</span>
            <span className="mx-2">|</span>
            <span>{selectedLanguage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
