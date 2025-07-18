"use client"

import { useEditor, EditorContent, JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export function RichTextRenderer({ content }: { content: JSONContent }) {
  const editor = useEditor({
    editable: false,
    extensions: [StarterKit],
    content,
  })

  if (!editor) return null

  return <EditorContent editor={editor} />
}
