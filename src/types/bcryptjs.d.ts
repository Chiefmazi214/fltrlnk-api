declare module 'bcryptjs' {
    export function hash(s: string | Buffer, salt: string | number): Promise<string>;
    export function compare(s: string | Buffer, hash: string): Promise<boolean>;
    export function genSalt(rounds?: number): Promise<string>;
} 