interface ImportMetaEnv {
    readonly VITE_BACKEND_API: string;
    readonly VITE_PROCESSING_API: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}