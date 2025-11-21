declare module 'adm-zip' {
  export interface IZipEntry {
    entryName: string;
    getData(): Buffer;
  }

  export default class AdmZip {
    constructor(buffer: Buffer);
    getEntry(name: string): IZipEntry | null;
    getEntries(): IZipEntry[];
  }
}

