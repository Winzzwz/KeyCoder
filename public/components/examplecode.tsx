"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay } from "@fortawesome/free-solid-svg-icons"
import { RichTextRenderer } from "@/components/rich-text-renderer"
import { CodeMirrorEditorV2 } from "@/components/code-mirror-editor-v2"
import { testCourseCode } from "@/lib/api"

interface ExCodeProps {
  inputs?: { label: string }[]
  content: any
  input: string
  output: string
}

export function ExCodeCard({ content, code, inputs = [], input, output }: ExCodeProps) {
  const [editor, setEditor] = useState(code)
  const [inputValues, setInputValues] = useState<string[]>(Array(inputs.length).fill(""))
  const [outputConsole, setOutputConsole] = useState("")
  const [outputConsoleColor, setOutputConsoleColor] = useState("text-white-400")

  const handleInputChange = (index: number, value: string) => {
    const updated = [...inputValues]
    updated[index] = value
    setInputValues(updated)
  }

  const handleSubmit = async () => {
    try {
      setOutputConsoleColor("text-purple-500")
      setOutputConsole("กำลังตรวจสอบโค้ด...")
      const formattedInputs =
        inputValues.length === 0 ? "" : inputValues.join("\n")

      const info = await testCourseCode(
        editor,
        formattedInputs,
      )

      console.log(info)
      setOutputConsole(info.output || "📭 No output.")
      setOutputConsoleColor(info.success ? "text-green-400" : "text-red-500")
    } catch (error) {
      console.error("Error testing code:", error)
      setOutputConsole("😨 มีความปกติในฝั่งของเรา โปรดรอสักครู่ก่อนดำเนินการต่อ")
      setOutputConsoleColor("text-red-500")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>🚩 ลองใช้</CardTitle>
          <CardDescription>ลองใช้เองดูสิ ว่าเป็นยังไง</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <RichTextRenderer content={{ type: "doc", content }} />
          </div>

          <CodeMirrorEditorV2
            initialCode={editor}
            onChange={setEditor}
            height="200px"
            readOnly={true}
          />

          {inputs.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">📥 Input</label>
              {inputs.map((input, index) => (
                <input
                  key={index}
                  type="text"
                  value={inputValues[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md bg-muted/30 text-white border border-muted placeholder:text-muted-foreground mb-1"
                  placeholder={`กรอก ${input.label.toLowerCase()}`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Button onClick={handleSubmit} size="sm" className="px-3">
              <FontAwesomeIcon icon={faPlay} className="h-4 w-4" />
            </Button>
            <div className={`bg-black ${outputConsoleColor} text-sm px-4 py-1.5 rounded-md font-mono whitespace-pre-wrap min-w-[100px]`}>
              {outputConsole || "📭 No output yet."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
