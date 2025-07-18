export function handleError(set: any, statusCode: number, errorMessage: string) {
    set.status = statusCode
    return { error: errorMessage, status: statusCode }
}

export function handleModuleError(statusCode: number, errorMessage: string) {
    return {success: false, status: statusCode, error: errorMessage}
}

export function handleModuleSuccess(data: any) {
    return {success: true, status: 200, data: data}
}