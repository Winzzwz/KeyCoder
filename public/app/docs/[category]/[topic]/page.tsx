"use client"

import { useState, useEffect, Key } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { MinigameCanvas } from "@/components/minigame-canvas"
import { CourseProgress } from "@/components/course-progress"
import { PythonSkillDialog } from "@/components/python-skill-dialog"
import { RichTextRenderer } from "@/components/rich-text-renderer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes, faCode, faArrowRight, faCheck, faBook, faBars } from "@fortawesome/free-solid-svg-icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCourseInfo, getUserProfile, setCourseTopicIndex, getCategoryInfo } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeMirrorEditorV2 } from "@/components/code-mirror-editor-v2"
import Image from "next/image"
import { CodeGameCard } from "@/components/gameproblem"
import { ExCodeCard } from "@/components/examplecode"

// const sidebarItems = [
//   {key: "intro", label:"ยินดีต้อนรับสู่ Python!", category: "basics", id: 1},
//   {key: "datatypes", label:"ประเภทของข้อมูล", category: "basics", id: 2},
//   {key: "syntax", label:"ไวยากรณ์", category: "basics", id: 3},
//   {key: "operators", label:"เครื่องหมายการดำเนินการ", category: "basics", id: 4},
//   {key: "numbers", label:"เลข", category: "basics", id: 5},
//   {key: "strings", label:"สตริง", category: "basics", id: 6},
//   {key: "variables", label:"ตัวแปร", category: "basics", id: 7},
//   {key: "arrays", label:"อาร์เรย์", category: "basics", id: 8},
//   {key: "conditionals", label:"เงื่อนไข", category: "basics", id: 9},
//   {key: "loops", label:"ลูป", category: "basics", id: 10},
// ]

type UserType = {
  level: number
  course: number
  isFirstLogin: number
}

// const docContentv2 = {basics:{
//   intro: {
//     title: "👋 ยินดีต้อนรับสู่ 🐍 Python!",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "👋 ยินดีต้อนรับสู่ 🐍 Python! เรามาเริ่มเรียนรู้ Python กันเลยดีกว่า!" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "Python คืออะไร? Python คือภาษาเขียนโปรแกรมระดับสูงที่ใช้งานง่ายมาก ๆๆ" }]
//           },
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [{ type: "text", text: "✨ สิ่งที่ Python ทำได้พิเศษกว่าภาษาอื่น ๆ คือ" }]
//           },
//           {
//               type: "bulletList",
//               content: [
//                 {
//                   type: "listItem",
//                   content: [
//                     {
//                       type: "paragraph",
//                       content: [{ type: "text", text: "เรียนรู้ได้ง่ายและเร็วมาก ๆ" }]
//                     }
//                   ]
//                 },
//                 {
//                   type: "listItem",
//                   content: [
//                     {
//                       type: "paragraph",
//                       content: [{ type: "text", text: "โค้ดสั้นและกระชับ ไม่มีเขียนเยอะ ๆ เหมือนภาษาอื่น" }]
//                     }
//                   ]
//                 },
//                 {
//                   type: "listItem",
//                   content: [
//                     {
//                       type: "paragraph",
//                       content: [{ type: "text", text: "มี Library และ Framework เยอะ (คืออะไรเดี๋ยวมีบอกอีกที)" }]
//                     }
//                   ]
//               },
//             ]
//           },
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [{ type: "text", text: "📖 สิ่งที่จะได้รับจากการเรียนคอร์สนี้จบ" }]
//           },
//           {
//             type: "bulletList",
//             content: [
//               {
//                 type: "listItem",
//                 content: [
//                   {
//                     type: "paragraph",
//                     content: [{ type: "text", text: "พื้นฐานแน่น ๆ นำไปต่อยอดได้ชิว ๆ" }]
//                   }
//                 ]
//               },
//               {
//                 type: "listItem",
//                 content: [
//                   {
//                     type: "paragraph",
//                     content: [{ type: "text", text: "เขียน Python ได้แน่นอนแบบเท่ ๆ เลย" }]
//                   }
//                 ]
//               },
//             ]
//           },
//           {
//             type: "heading",
//             attrs: {level: 3},
//             content: [{ type: "text", text: "ไปลุยกันเลย!!!" }]
//           },
//         ]
//       },
//     ]
//   },
//   datatypes: {
//     title: "🌈 ประเภทของข้อมูล",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [ { type: "text", text: "ประเภทของข้อมูลใน 🐍 Python" } ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "🐍 Python รองรับชนิดข้อมูลพื้นฐานหลายชนิด ตั้งแต่ตัวเลข ตัวอักษร ตรรกะ ไปจนถึงโครงสร้างข้อมูลแบบลำดับและแบบกำหนดคู่คีย์‑ค่า" } ]
//           },
//           {
//             type: "bulletList",
//             content: [
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🔴 int - จำนวนเต็ม เช่น 42, -7" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🔵 float - จำนวนจริง เช่น 3.14, -0.001" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟡 str - ข้อความ เช่น \"สวัสดี\"" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟢 bool - ค่าตรรกะ True หรือ False" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟣 list - ลำดับที่ปรับเปลี่ยนได้ เช่น [1, 2, 3]" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "⚪ tuple - ลำดับที่เปลี่ยนค่าไม่ได้ เช่น (1, 2, 3)" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟠 set - เซตที่เก็บค่าที่ไม่ซ้ำ เช่น {1, 2, 3}" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟤 dict - คู่คีย์‑ค่า เช่น {\"name\": \"Thomas\", \"age\": 15}" } ] } ] }
//             ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "ชนิดข้อมูลสามารถตรวจสอบได้ด้วยฟังก์ชัน type() และแปลงไปมาด้วยฟังก์ชันอย่าง int(), float(), str() เป็นต้น" } ]
//           }
//         ]
//       },
//       {
//         type: "exCode",
//         inputs: [],
//         input: "",
//         output: "4 3.14 True Hello ['A', 'B', 'C']",
//         code: "Num = 4\nPi = 3.14\nFlag = True\nText = \"Hello\"\nLetters = ['A', 'B', 'C']\nprint(Num, Pi, Flag, Text, Letters)",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 4 },
//             content: [ { type: "text", text: "ทดลอง print ประเภทข้อมูลต่าง ๆ" } ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "</> โค้ดตัวอย่างนี้สร้างตัวแปรแต่ละชนิดข้อมูลและพิมพ์ค่าทั้งหมดออกมาในบรรทัดเดียว" } ]
//           }
//         ]
//       }
//     ]
//   },
//   syntax: {
//     title: "✍️ ไวยากรณ์",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [ { type: "text", text: "✍️ ไวยากรณ์พื้นฐานของ 🐍 Python" } ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "✍️ ไวยากรณ์ (Syntax) คือรูปแบบการเขียนที่ถูกต้องของภาษา Python ซึ่งเป็นสิ่งสำคัญที่ต้องเข้าใจเพื่อให้เขียนโค้ดได้อย่างถูกต้องและไม่เกิดข้อผิดพลาด" } ]
//           },
//           {
//             type: "bulletList",
//             content: [
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟥 การเยื้องบรรทัด (Indentation): ใช้เว้นวรรคเพื่อแสดงโครงสร้างของโค้ด เช่น ในเงื่อนไขหรือฟังก์ชัน" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟧 การประกาศตัวแปร: ไม่ต้องระบุชนิดข้อมูล ใช้ = เช่น x = 10" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟨 คำสั่งเงื่อนไข: ใช้ if, elif, else" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟩 การทำซ้ำ: ใช้ for หรือ while เพื่อวนลูป" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟦 คำสั่งพิมพ์: ใช้ print() เพื่อแสดงผล" } ] } ] }
//             ]
//           }
//         ]
//       },
//       {
//         type: "exCode",
//         inputs: [],
//         input: "",
//         output: "",
//         code: "print(\"Hello World!\")\nx = 10\nif x % 2 == 0:\n    print(f'{x} is even')",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 4 },
//             content: [ { type: "text", text: "ตัวอย่างการใช้ if และ print()" } ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "ตัวอย่างนี้ใช้ print() เพื่อแสดงข้อความ และใช้ if เพื่อตรวจสอบว่าค่า x เป็นเลขคู่หรือไม่" } ]
//           }
//         ]
//       },
//       {
//         type: "game",
//         image: "/images/syntax/1.png",
//         inputs: [],
//         input: "",
//         output: "Hello Python",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 4 },
//             content: [ { type: "text", text: "ทดสอบคำสั่ง print() 🔤" } ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "พิมพ์โค้ดเพื่อแสดงข้อความ \"Hello Python\" โดยใช้คำสั่ง print() ด้านล่าง" } ]
//           },
//         ]
//       }
//     ]
//   },
//   variable: {
//     title: "ตัวแปร",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: {
//               level: 3
//             },
//             content: [{ type: "text", text: "การใช้ตัวแปรใน Python" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "ในภาษา Python ตัวแปรใช้สำหรับเก็บข้อมูลต่าง ๆ เช่น ตัวเลข ข้อความ และอื่น ๆ โดยไม่ต้องระบุชนิดข้อมูลล่วงหน้า" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "สามารถตั้งชื่อตัวแปรได้อย่างอิสระ แต่ควรตั้งชื่อให้อ่านเข้าใจง่าย และสื่อความหมายถึงข้อมูลที่เก็บอยู่" }]
//           },
//           {
//             type: "codeBlock",
//             attrs: { language: "python" },
//             content: [
//               { type: "text", text: "age = 15\nname = \"Thomas\"\nheight = 172.5\nis_student = True" }
//             ]
//           }
//         ]
//       },
//       {
//         type: "game",
//         image: "/images/variables/1.png",
//         input: "",
//         output: "Win 35 False",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 1 },
//             content: [{ type: "text", text: "เกม: สร้างตัวแปรให้ถูกต้อง! 🧠" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "เขียนโค้ดเพื่อประกาศตัวแปร name ให้เป็น \"Win\", age ให้เป็น 35 และ is_student ให้เป็น False จากนั้นให้ print ทั้งสามค่าออกมา" }]
//           },
//           {
//             type: "codeBlock",
//             attrs: { language: "python" },
//             content: [{ type: "text", text: "คำใบ้: print() สามารถเพิ่มเว้นวรรคได้โดยใช้ , เช่น print(name,age,is_student)" }]
//           }
//         ]
//       }
//     ]
//   },
//   operators: {
//     title: "➕ เครื่องหมายการดำเนินการ",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [ { type: "text", text: "เครื่องหมายการดำเนินการใน Python ➕➖✖️➗" } ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "เรียนรู้การใช้เครื่องหมายเพื่อคำนวณใน Python เช่น +, -, *, /, %, //, ** ซึ่งแต่ละตัวมีหน้าที่แตกต่างกันไป เช่น บวก ลบ คูณ หาร หารเอาเศษ หารปัดเศษ และยกกำลัง" } ]
//           },
//           {
//             type: "bulletList",
//             content: [
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "➕ `+` บวก เช่น 2 + 3 ได้ 5" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "➖ `-` ลบ เช่น 5 - 2 ได้ 3" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "✖️ `*` คูณ เช่น 2 * 4 ได้ 8" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "➗ `/` หาร เช่น 10 / 2 ได้ 5.0" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🟰 `//` หารปัดเศษ เช่น 10 // 3 ได้ 3" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "🧮 `%` หารเอาเศษ เช่น 10 % 3 ได้ 1" } ] } ] },
//               { type: "listItem", content: [ { type: "paragraph", content: [ { type: "text", text: "⚡ `**` ยกกำลัง เช่น 2 ** 3 ได้ 8" } ] } ] }
//             ]
//           }
//         ]
//       },
//       {
//         type: "exCode",
//         inputs: [],
//         input: "",
//         output: "",
//         // code: "x = 4\ny = 5\nprint(\"ผลรวม =\", x + y)\nprint(\"กำลัง =\", x ** 2)",
//         code:`x = 4
// y = 5
// print("Sum =", x + y)
// print("Square =", x ** 2)`,
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 4 },
//             content: [ { type: "text", text: "ตัวอย่างการใช้เครื่องหมาย + และ **" } ]
//           },
//         ]
//       },
//       {
//         type: "game",
//         image: "/images/operators/1.png",
//         inputs: [],
//         input: "",
//         output: "231304695889",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 4 },
//             content: [ { type: "text", text: "เกม: คิดเลขด้วย Python 🧠" } ]
//           },
//           {
//             type: "paragraph",
//             content: [ { type: "text", text: "คิดเลข 121 บวก 232 คูณ 999 ยกกำลัง 3 แล้วแสดงผลด้วย print()" } ]
//           },
//           {
//             type: "codeBlock",
//             attrs: { language: "python" },
//             content: [{ type: "text", text: "คำใบ้: อย่าคิดเอง มันง่ายกว่าเยอะถ้าใช้ Python!" }]
//           }
//         ]
//       }
//     ]
//   },
//   condition: {
//     title: "🧩 เงื่อนไข",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [{ type: "text", text: "การใช้เงื่อนไขใน 🐍 Python" }]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "ในการเขียนโปรแกรมหลาย ๆ ครั้งเราก็อยากให้โปรแกรมมันทำงานต่างกัน ตามเงื่อนไข เช่น ตรวจสอบคะแนนว่าถ้า มากกว่า 50 ให้ผ่าน น้อยกว่า 50 ให้ตก" }
//             ]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "🧩 " },
//               { type: "text", marks: [{ type: "bold" }], text: "if" },
//               { type: "text", text: " ใช้เมื่อต้องการตรวจสอบว่าเงื่อนไขเป็นจริงหรือไม่" }
//             ]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "🔁 " },
//               { type: "text", marks: [{ type: "bold" }], text: "elif" },
//               { type: "text", text: " ใช้เมื่อต้องการตรวจสอบเงื่อนไขเพิ่มเติม หากเงื่อนไขก่อนหน้าไม่เป็นจริง" }
//             ]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "🛑 " },
//               { type: "text", marks: [{ type: "bold" }], text: "else" },
//               { type: "text", text: " ใช้เมื่อต้องการทำบางอย่างเมื่อเงื่อนไขข้างบนไม่เป็นจริงทั้งหมด" }
//             ]
//           }
//         ]
//       },
//       {
//         type: "exCode",
//         inputs: [],
//         input: "",
//         output: "",
//         code: `score = 70

// if score >= 80:
//   print("A")
// elif score >= 70:
//   print("B")
// elif score >= 60:
//   print("C")
// else:
//   print("Better Luck Next Time!")`,
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [{ type: "text", text: "ตัวอย่างการใช้ if-elif-else" }]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "โค้ดนี้จะแสดงเกรดตามคะแนน ลองเปลี่ยนค่า " },
//               { type: "text", marks: [{ type: "code" }], text: "score" },
//               { type: "text", text: " แล้วรันดูสิว่าจะได้เกรดอะไร 🎓" }
//             ]
//           }
//         ]
//       },
//       {
//         type: "game",
//         image: "/images/intro/2.jpg",
//         inputs: [],
//         input: "",
//         output: "",
//         content: [
//           {
//             type: "heading",
//             attrs: { level: 3 },
//             content: [{ type: "text", text: "ลองเขียนเงื่อนไขด้วยตัวเอง!" }]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "เขียนโปรแกรมที่รับค่าอายุในตัวแปร " },
//               { type: "text", marks: [{ type: "code" }], text: "age" },
//               { type: "text", text: " แล้วแสดงผลว่า:" }
//             ]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "- หากอายุน้อยกว่า 13 ให้พิมพ์ว่า " },
//               { type: "text", marks: [{ type: "code" }], text: "เด็ก" }
//             ]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "- หากอายุน้อยกว่า 20 ให้พิมพ์ว่า " },
//               { type: "text", marks: [{ type: "code" }], text: "วัยรุ่น" }
//             ]
//           },
//           {
//             type: "paragraph",
//             content: [
//               { type: "text", text: "- หากมากกว่านั้น ให้พิมพ์ว่า " },
//               { type: "text", marks: [{ type: "code" }], text: "ผู้ใหญ่" }
//             ]
//           },
//           {
//             type: "codeBlock",
//             attrs: { language: "python" },
//             content: [{ type: "text", text: "" }]
//           }
//         ]
//       }
//     ]
//   },
//   numbers: {
//     title: "เลข",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: {
//               level: 3
//             },
//             content: [{ type: "text", text: "การใช้ตัวเลขใน Python" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "เรียนรู้การใช้ตัวเลขใน Python รวมถึง int และ float" }]
//           },
//         ]
//       }
//     ]
//   },
//   strings: {
//     title: "สตริง",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: {
//               level: 3
//             },
//             content: [{ type: "text", text: "การใช้สตริงใน Python" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "เรียนรู้การใช้สตริงใน Python รวมถึงการต่อสตริงและการใช้งาน string methods" }]
//           },
//         ]
//       }
//     ]
//   },
//   arrays: {
//     title: "อาร์เรย์",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: {
//               level: 3
//             },
//             content: [{ type: "text", text: "การใช้อาร์เรย์ใน Python" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "เรียนรู้การใช้ list และ array ใน Python" }]
//           },
//         ]
//       }
//     ]
//   },
//   loops: {
//     title: "ลูป",
//     content: [
//       {
//         type: "doc",
//         content: [
//           {
//             type: "heading",
//             attrs: {
//               level: 3
//             },
//             content: [{ type: "text", text: "การใช้ลูปใน Python" }]
//           },
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "เรียนรู้การใช้ for loop และ while loop ใน Python" }]
//           },
//         ]
//       }
//     ]
//   },
// }}

const courseMapping: Record<string, number> = {}
const topicMapping: Record<number, string> = {}

export default function DocTopicPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [completedCourses, setCompletedCourses] = useState<number[]>([])
  const [showLevelDialog, setShowLevelDialog] = useState(false)
  const [courseCompleted, setCourseCompleted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [documentationContent, setDocumentationContent] = useState(null)
  const [sidebarItems, setSidebarItems] = useState([])

  const router = useRouter()
  const params = useParams()

  const category = params?.category as string ?? ""
  const topic = params?.topic as string ?? ""

  useEffect(() => {
    async function fetchUserData() {
      try {
      const userData = await getUserProfile()
      if (!userData) return
      setUser(userData)

      const sidebarData = await getCategoryInfo(category)
      setSidebarItems(sidebarData)

      if (userData.skillLevel === 0) {
        console.log("You haven't selected your skill level yet. returning back to /docs.")
        router.push("/docs")
        return
      }

      sidebarData.forEach((info: { key: string; id: number }) => {
        courseMapping[info.key] = info.id
        topicMapping[info.id] = info.key
      })

        // console.log(docContent)
        const catContent = await getCourseInfo(category)
        const docContent = {[category.toString()]: catContent}
        // const docContent = docContentv2
        // console.log(docContent)
        setDocumentationContent(docContent)
        const completedAmount = userData.courseProgress[category]
        
        const unlockedCourses = Object.entries(courseMapping)
          .filter(([_, id]) => id <= completedAmount)
          .map(([_, id]) => id)

        setCompletedCourses(unlockedCourses)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
    setIsSidebarOpen(true)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  const content =
    documentationContent[category as keyof typeof documentationContent]?.[
      topic as keyof typeof documentationContent.basics
    ]

  if (!content) {
    router.push("/docs")
    return null
  }

  const currentCourseId = courseMapping[topic] || 0
  const isCourseCompleted = completedCourses.includes(currentCourseId)
  const shouldShowMinigame = user && user.level !== 3 && currentCourseId && !isCourseCompleted

  const canAccessCourse = (courseId: number) => {
    const completed = user.courseProgress[category]
    return courseId <= completed + 1
  }

  const getNextCourse = () => {
    const nextTopic = topicMapping[currentCourseId + 1]
    return { category: "basics", topic: nextTopic }
  }

  const handleCourseComplete = async () => {
    if (!user) return
    const newCompleted = [...completedCourses, currentCourseId]
    setCompletedCourses(newCompleted)
    setCourseCompleted(true)

    try {
      await setCourseTopicIndex(category,currentCourseId)
    } catch (error) {
      console.error("Error updating course:", error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebarOnClick = () => {
    setIsSidebarOpen(false)
  }

  const renderContent = (contentItem: any, index: number) => {
    if (contentItem.type === "doc") {
      return (
        <div key={index} className="prose prose-neutral dark:prose-invert max-w-none mb-8">
          <RichTextRenderer content={{ type: "doc", content: contentItem.content }} />
        </div>
      )
    } else if (contentItem.type === "game") {
      return (
        <div key={index} className="grid grid-cols-1 lg:grid-cols-[1fr_0px] gap-6">
          <CodeGameCard image={contentItem.image} content={contentItem.content} inputs={contentItem.inputs} input = {contentItem.input} output = {contentItem.output}/>
        </div>
      )
    } else if (contentItem.type === "exCode") {
      // console.log("adding excode")
      return (
        <div key={index} className="grid grid-cols-1 lg:grid-cols-[1fr_0px] gap-6">
          <ExCodeCard content={contentItem.content} code={contentItem.code} inputs={contentItem.inputs} input = "" output = "" />
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Sidebar Toggle Button */}
        <Button
          onClick={toggleSidebar}
          size="sm"
          variant="ghost"
          className="fixed top-20 left-4 z-50 backdrop-blur-sm border border-gray-600/50"
        >
          <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
        </Button>

        {/* Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 h-full w-80 backdrop-blur-sm border-r border-white/20 z-50"
            >
              <div className="p-6 pt-20 overflow-y-auto h-full">
                {/* Close button */}
                <Button
                  onClick={() => setIsSidebarOpen(false)}
                  size="sm"
                  variant="ghost"
                  className="absolute top-4 right-4"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </Button>

                {user && (
                  <div className="mb-6">
                    <CourseProgress
                      userLevel={user.skillLevel || 0}
                      currentCourse={user.courseProgress[{category}] || 1}
                      completedCourses={completedCourses}
                    />
                  </div>
                )}

                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const canAccess = canAccessCourse(item.id)
                    const isCompleted = completedCourses.includes(item.id)
                    const isCurrent = item.id === (user?.course || 1)

                    return (
                      <Link
                        key={item.key}
                        href={canAccess ? `/docs/${category}/${item.key}` : "#"}
                        onClick={closeSidebarOnClick}
                        className={`block px-4 py-2 rounded-lg transition-colors ${
                          topic === item.key
                            ? "bg-purple-600/20 text-purple-400 border-l-2 border-purple-400"
                            : canAccess
                            ? isCompleted
                              ? "text-green-400 hover:text-green-300 hover:bg-gray-800/50"
                              : isCurrent
                              ? "text-yellow-400 hover:text-yellow-300 hover:bg-gray-800/50"
                              : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                            : "text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{item.label}</span>
                          <div className="flex items-center space-x-1">
                            {isCompleted && (
                              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-green-400" />
                            )}
                            <FontAwesomeIcon icon={faBook} className="h-3 w-3 opacity-50" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 relative min-h-0">
          <div className="p-8 lg:p-8 pt-16 lg:pt-8 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-400">
                <span>docs</span>
                <span>{">"}</span>
                <span>{category}</span>
                <span>{">"}</span>
                <span>{content.title}</span>
              </nav>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h1 className="text-3xl lg:text-5xl font-bold mb-4">{content.title}</h1>
            </motion.div>

            {/* Course Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <div className="flex justify-center items-center space-x-2 flex-wrap">
                {isCourseCompleted && (
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                    <FontAwesomeIcon icon={faCheck} className="mr-1 h-3 w-3" />
                    เสร็จสิ้นแล้ว
                  </Badge>
                )}
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  คอร์ส {currentCourseId}/10
                </Badge>
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 w-full max-w-7xl"
              >
                {content.content?.map((contentItem, index) =>
                  renderContent(contentItem, index)
                )}
              </motion.div>
            </div>

            {/* Complete Course Button */}
            {!isCourseCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <Button
                  onClick={handleCourseComplete}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  เสร็จสิ้นคอร์ส
                  <FontAwesomeIcon icon={faCheck} className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Next Course Button */}
            {isCourseCompleted && getNextCourse() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Link href={`/docs/${getNextCourse()?.category}/${getNextCourse()?.topic}`}>
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                  >
                    ไปบทเรียนถัดไป
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}