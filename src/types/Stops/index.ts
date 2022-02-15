export type Location = {
    x: number
    y: number
}

export type Stops = {
    url: string
    people: number
    batch: number
    route: string
    location: Location
    annotated?: string
    boarding?: string
    alighting?: string
    following?: boolean | null
    duration?: string
    temp_number?: string
}