const protocol = import.meta.env.SERVER_PROTOCOL || "http"
const host = import.meta.env.SERVER_HOST || "localhost"
const port = import.meta.env.SERVER_PORT || "3000"

export const API_URL = `${protocol}://${host}:${port}/api`
