// API endpoints
const API_BASE_URL = "https://keycoder.college/api"

// Types
export interface User {
  id: string
  email: string
  username: string
  password: string
  elo: number
  win: number
  loss: number
  settings: {
    theme: number
  }
  createDate: string
  skillLevel: number
  course: number
  courseProgress: {
    category:number
  }
}

export interface LoginResponse {
  message: string
  value: string
}

export interface TopUser {
  id: string
  username: string
  elo: number
  win: number
  loss: number
}

export interface MyRank {
  username: string
  elo: number
  rank: number
}

export interface courseOutput {
  success:boolean,
  output:string,
  color:string
}

export interface Course {}

// API functions

export async function getAvailableParties(): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/rooms-list`, {
      method:"GET",
      headers:{
        "Content-Type": "application/json",
      },
      credentials:"include",
    })

    if (!response.ok) {
      throw new Error(`HTTP - ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("error getAvailableParties error:",error)
    return []
  }
  // return [
  //   {"code":"PRTY01","name":"Party #1", "players":2,"maxPlayers":5,"mode":0,"taskType":0},
  // ]
}

export async function keycoderGetCode(gameId:string, userId:string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/code/${userId}`, {
      method:"GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include",
    })

    const info = await response.json()
    // console.log(info.data)
    return decodeURIComponent(info.data)
  } catch (error) {
    console.error("error keycoderGetCode code:",error)
    return 'print("There was an error while getting code")'
  }
}

export async function keycoderForfeit(): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/forfeit`, {
      method:"POST",
      headers: {
        "Content-Type": "0",
      },
      credentials:"include",
    })
    
    const info = await response.json()

    console.log(info)
  } catch (error) {
    console.error("An error has occured on keycoderForfeit code:",error)
  }
}

export async function keycoderSubmit(
  code:string
): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/submit`, {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include",
      body: JSON.stringify({"code": encodeURIComponent(code)})
    })
    
    const info = await response.json()

    console.log(info)
  } catch (error) {
    console.error("An error has occured on keycoderSubmit code:",error)
  }
}

export async function keycoderCompileCode(
  code: string,
  input: string,
  output: string
): Promise<{ success: boolean; output: string; expected: string; found: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        code,
        input,
      }),
    })

    if (!response.ok) throw new Error(`HTTP - ${response.status}`)

    const result = await response.json()

    const normalizedExpected = output.replace(/\s+/g, '')
    const normalizedActual = result.data.stdout.replace(/\s+/g, '')

    if (normalizedExpected === normalizedActual) {
      return {
        success: true,
        output: result.data.stdout,
        expected: "",
        found: "",
      }
    } else if (result.data.stderr === "") {
      return {
        success: false,
        output: "",
        expected: output,
        found: result.data.stdout,
      }
    } else {
      return {
        success: false,
        output: `${result.data.stdout}\n${result.data.stderr}`,
        expected: "",
        found: "",
      }
    }
  } catch (error) {
    console.error("error keycoderCompileCode code:", error)
    return {
      success: false,
      output: "เกิดปัญหาในฝั่งของเรา",
      expected: "",
      found: "",
    }
  }
}

export async function keycoderGetTaskInfo(taskId:string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "GET",
      credentials:"include"
    })

    const info = await response.json()
    // console.log(info)

    if (info) {
      if (info.status && info.status === 404) {
        return {success:false,info:null}
      } else if (info.name) {
        return {success:true, info:info}
      } else {
        return {success:false, info:null}
      }
    }
  } catch (error) {

  }
}

export async function partyInfo(code:string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${code}/info`, {
      method: "POST",
      headers: {
        "Content-Type": "0"
      },
      credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("❌ partyInfo error code:",error)
  }
}

export async function leaveParty(): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "0"
      },
      credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("❌ leaveParty error code:",error)
  }
}

export async function joinParty(
  code:string
): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${code}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "0"
      },
      credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status} - ${errorText}`)
    }

    const info = await response.json()
    return await info
  } catch (error) {
    console.error("❌ joinParty error code:",error)
    return false
  }
}

export const createParty = async (name:string, mode:number, taskType:number, maxPlayers:number, isPrivate:boolean) => {
  const response = await fetch(`${API_BASE_URL}/game/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
    body: JSON.stringify({
      name,
      mode,
      taskType,
      maxPlayers,
      isPrivate
    })
  })

  const info = await response.json()
  // console.log(info)
  if (response.status === 409) {
    return {success:false, message:"คุณอยู่ในปาร์ตี้อยู่แล้ว! | Error 409", info:info.error}
  } else if (response.status == 200) {
    return {success:true, message:"สร้างปาร์ตี้สำเร็จ!", info: info}
  } else {
    return {success:false, message:"เกิดปัญหาระหว่างการสร้างปาร์ตี้!", info:{}}
  }
}

export const joinGame = async (gameId: string) => {
  const response = await fetch(`${API_BASE_URL}/game/${gameId}/join`, {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': '0',
    }
  })

  if (response.status === 404) {
    return false
  }

  return true
}

export const leaveGame = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/game/leave`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': '0',
      }
    })
    
    if (!response.ok) {
      throw new Error(`${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error leaveGame code:",error)
    return
  }
}

export const getTaskInfo = async (code:string) => {
  try {

  } catch (error) {
    console.error(error)
    return
  }
}

export const getGameInfo = async (gameId:string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/info`, {
      method: 'GET',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const json = await response.json()
    console.log(json)
    
    if (!response.ok) {
      throw new Error(`${response.status}`)
    }

    return json
  } catch (error) {
    console.error("Error getGameInfo:",error)
    return {};
  }
}

export async function getCategoryInfo(category:string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/info/${category}`,{
      method: "GET",
      credentials: "include",
    })

    // console.log(response.json())

    if (!response.ok) {
      throw new Error(`${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error getLeftSideCourse code:",error)
  }
}

export async function testCourseCode(code:string, input:string): Promise<any | null> {
  const response = await fetch(`${API_BASE_URL}/game/compile`, {
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      "code":encodeURIComponent(code),
      "input":input
    }),
  })
  if (!response.ok) {
    return {success:false, output:"😨 มีความปกติในฝั่งของเรา โปรดรอสักครู่ก่อนดำเนินการต่อ"}
  }

  const result = await response.json()

  return {success:(result.data.stderr === ""), output:(result.data.stdout + "\n" + result.data.stderr)}
}

export async function submitCourseGameCode(code:string, input:string, output:string): Promise<courseOutput | null> {
  // console.log(code,input,output)
  const response = await fetch(`${API_BASE_URL}/courses/submit`, {
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      "code":encodeURIComponent(code),
      "input":input,
      "output":output
    }),
  })

  const result = await response.json()
  if (!response.ok) return {success:false, output:"😨 มีความปกติในฝั่งของเรา โปรดรอสักครู่ก่อนดำเนินการต่อ"}

  if (result.data.stdout === output) {
    return {success:true, output:"✅ ถูกต้อง!\n"+result.data.stdout, color:"text-green-500"}
  } else if (result.data.stderr === "") {
    return {success:false, output:"❌ ผิด!\n"+"ต้องการ: "+output+"\nเจอ: "+result.data.stdout, color:"text-red-500"}
  } else {
    return {success:false, output:"⚠️ เกิดปัญหา!\n"+result.data.stdout+"\n"+result.data.stderr, color:"text-yellow-500"}
  }
}

export async function setCourseTopicIndex(course:string, topic_index:number): Promise<any | null> {
  try {
    // console.log(course,topic_index)
    const response = await fetch(`${API_BASE_URL}/courses/set-course-progress`, {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({"course":course,"progress":topic_index}),
    })

    // console.log(response.json())

    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Error setting course topic error code: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error setCourseTopicIndex:",error)
  }
}

export async function getUserProfile(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "GET",
      credentials: "include",
    })

    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Error fetching user profile: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getUserProfile:", error)
    return null
  }
}

export async function getCourseInfo(topic:string) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${topic}`, {
      method: "GET",
      credentials: "include",
    })

    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Error getCourseInfo: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error getCourseInfo: ${error}`)
  }
}

export async function setSkillLevel(lvl: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/set-skill-level`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ "level":lvl }),
    })

    if (!response.ok) {
      throw new Error(response.status)
    }

    return { success: true, message: "ตั้งค่าระดับสำเร็จ" }
  } catch (error) {
    console.error("Error setSkillLevel code:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการตั้งค่าระดับ" }
  }
}

export async function registerUser(
  email: string,
  username: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
      credentials: "include",
    })

    if (response.status === 422) {
      return { success: false, message: "รูปแบบไม่ถูกต้อง!" }
    }

    if (response.status === 409) {
      const errorData = await response.json()
      if (errorData.message.includes("email")) {
        return { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" }
      } else {
        return { success: false, message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" }
      }
    }

    if (!response.ok) {
      throw new Error(`Error registering user: ${response.status}`)
    }

    return { success: true, message: "สมัครสมาชิกสำเร็จ" }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }
  }
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    })

    if (response.status === 400) {
      return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }
    }

    // console.log(response.json())

    if (!response.ok) {
      throw new Error(`Error logging in: ${response.status}`)
    }

    const data: LoginResponse = await response.json()
    return { success: true, message: data.message }
  } catch (error) {
    console.error("Error logging in:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }
  }
}

export async function changePassword(
  oldP: string,
  newP: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/re-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "oldPassword":oldP,
        "newPassword":newP
      }),
      credentials: "include",
    })

    const data = await response.json()
    // console.log(data)

    if (response.status === 400) {
      if (data.message.includes("same")) {
        return { success: false, message: "รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเดิม" }
      } else {
        return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านเดิมไม่ถูกต้อง" }
      }
    }

    if (!response.ok) {
      throw new Error(`Error changing password: ${response.status}`)
    }

    return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" }
  } catch (error) {
    console.error("Error changing password:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" }
  }
}

export async function getTopUsers(): Promise<TopUser[] | null> {
  // console.log("getTopUsers has been called")
  try {
    const response = await fetch(`${API_BASE_URL}/user/top`, {
      method: "GET",
      credentials: "include",
    })

    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Error fetching top users: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching top users:", error)
    return null
  }
}

export async function getMyRank(): Promise<MyRank | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "GET",
      credentials: "include",
    })

    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Error fetching my rank: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching my rank:", error)
    return null
  }
}

export async function updateTheme(theme: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/theme`, {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "theme":theme
      }),
      credentials: "include",
    })

    if (response.status == 200) {
      return { success: true, message: "อัปเดตธีมสำเร็จ" }
    }
    if (!response.ok) {
      throw new Error(`Error fetching theme: ${response.status}`)
    }
    return { success: false, message: "เปลี่ยนธีมไม่สำเร็จ" }
  } catch (error) {
    console.error("Error updating theme:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการอัปเดตธีม" }
  }
}

export async function startGame(lobbyCode: string): Promise< {success:boolean, status:number} | null > {
  try {
    const response = await fetch(`${API_BASE_URL}/game/start`, {
      method:"POST",
      headers: {
        "Content-Type": "0",
      },
      credentials: "include",
    })

    // console.log(await response.json())
    return await response.json()
  } catch (error) {
    console.error("error startGame code:",error)
  }
}