export type Dictionary<T> = { [key: string]: T, [key: number]: T };

export type Configuration<T> = { -readonly [option in keyof T]: T[option] };
