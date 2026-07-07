export function success<T>(data: T) {
    return {
        success: true,
        data,
    };
}

// TODO: Add failed response function
export function failed(error: any) {
    return {
        success: false,
        error,
    };
}
