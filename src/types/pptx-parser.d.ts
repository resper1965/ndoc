declare module 'pptx-parser' {
  export default class PptxParser {
    constructor();
    parse(buffer: Buffer): Promise<any>;
  }
}

