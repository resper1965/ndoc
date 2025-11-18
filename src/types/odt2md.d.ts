declare module 'odt2md' {
  export default function odt2md(buffer: Buffer): Promise<string>;
}

