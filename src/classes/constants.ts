export const errors = {
    unknownError: "Unknown Error",

    unauthorized: "Unauthorized",
    invalidRequest: "Invalid Request",
    usernameoremailTaken: "This Username or Email was Taken",
    loginFailed: "Username or Password is incorrect",
    repasswordFailed: "Can't reset the Password",
    setSkillFailed: "Can't set the skill level",
    setCourseFailed: "Can't set the course progress",
    userNotFound: "User not found",
    setThemeFailed: "Can't set the theme",

    alreadyInRoom: "You're already in the room",
    roomNotFound: "Room not found",
    roomStarted: "Room started",
    roomFull: "Room is full",
    playerNotFound: "Player not found",
    notHost: "You're not host",
    notEnoughPlayers: "Not enough player",
    roomInvalidState: "Invalid room's state",
    playerSubmitted: "Player already submmitted code",
    playerNotSubmitted: "Player is not submmitted code yet",

    taskNotFound: "Task not found",

    outputTooLong: "Output is too long"
}

export const successes = {
    roomDeleted: "Room deleted",
    roomLeft: "Left from room",
    roomStarted: "Room started",
}

export const defaultSettings = {
    theme: 1
}

export const defaultCourses = {
    basics: 0
}

export const maxElo = 2000