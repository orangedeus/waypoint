/// <reference types="react-scripts" />

declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.scss' {
    const content: string;
    export default content;
}