class ApiError extends Error {
    static unauthorized() {
        return new ApiError(401, 'Пользователь не авторизован')
    }

    static badRequest(message) {
        return new ApiError(400, message)
    }

    static internal() {
        return new ApiError(500, 'Непредвиденная ошибка')
    }

    static forbidden() {
        return new ApiError(403, 'Ограничено в доступе')
    }
}

module.exports = ApiError