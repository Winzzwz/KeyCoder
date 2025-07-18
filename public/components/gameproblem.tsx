"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay } from "@fortawesome/free-solid-svg-icons"
import { RichTextRenderer } from "@/components/rich-text-renderer"
import { CodeMirrorEditorV2 } from "@/components/code-mirror-editor-v2"
import { submitCourseGameCode } from "@/lib/api"
import Image from "next/image"

interface CodeGameCardProps {
  image: string
  inputs?: { label: string }[]
  content: any
  input: string
  output: string
}

export function CodeGameCard({ image, content, inputs = [], input, output}: CodeGameCardProps) {
  const [code, setCode] = useState('print("Hello World!")')
  const [inputValues, setInputValues] = useState<string[]>(Array(inputs.length).fill(""))
  const [outputConsole, setoutputConsole] = useState("")
  const [outputConsoleColor, setoutputConsoleColor] = useState("text-white-400")

  const handleInputChange = (index: number, value: string) => {
    const updated = [...inputValues]
    updated[index] = value
    setInputValues(updated)
  }

  const handleSubmit = async () => {
    setoutputConsole("กำลังตรวจสอบโค้ด...")
    setoutputConsoleColor("text-purple-400")
    const info = await submitCourseGameCode(
      code,
      input,
      output
    )
    
    setoutputConsole(info.output || "📭 No output.")
    // setoutputConsoleColor(info.success ? "text-green-400" : "text-red-500")
    setoutputConsoleColor(info.color)
    // if (info.output === output) {
    //   setoutputConsole("✅ " + info.output)
    //   setoutputConsoleColor("text-green-400")
    // } else {
    //   setoutputConsole("❌ Incorrect! \n" + "Found: "+ info.output + "\nExpected: "+ output)
    //   setoutputConsoleColor("text-red-500")
    // }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>🎮 เกมโจทย์</CardTitle>
          <CardDescription>ลองเล่นเกมตรวจสอบความเข้าใจดูหน่อย</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {image && (
              <Image
                src={image}
                alt="Context Image"
                width={750}
                height={250}
                className="rounded-lg"
              />
            )}
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <RichTextRenderer content={{ type: "doc", content }} />
          </div>

          <CodeMirrorEditorV2
            initialCode={code}
            onChange={setCode}
            height="200px"
          />

          {inputs.length > 0 && (
            <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground block">📥 Input</label>
              {inputs.map((input, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={inputValues[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md bg-muted/30 text-white border border-muted placeholder:text-muted-foreground"
                    placeholder={`กรอก ${input.label.toLowerCase()}`}
                  />
                </div>
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
