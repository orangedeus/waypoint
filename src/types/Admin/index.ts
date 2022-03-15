

export type DashboardStats = {
    stops: string
    codes: string
    annotations: string
    uploaded_videos: string
}

export type Coordinate = {
    x: number
    y: number
}

export type FileStops = {
    location: Coordinate
    time: Date
    url: string
    duration: number
}