declare module 'rtf-parser' {
  export interface RTFNode {
    content?: RTFNode[];
    text?: string;
  }

  export interface RTFDocument {
    content?: RTFNode[];
  }

  export default class RTFParser {
    parse(rtf: string): Promise<RTFDocument>;
  }
}

