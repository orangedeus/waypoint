export type Privileges = 0 | 1
export type Status = 0 | 1

export type Auth = {
    admin: Privileges
    code?: string
    surveyed?: 0 | 1
    user: Status
}