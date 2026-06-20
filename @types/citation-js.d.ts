declare module "citation-js" {
  interface CiteData {
    id?: string;
    title?: string;
    author?: { given?: string; family?: string }[];
    publisher?: string;
    "publisher-place"?: string;
    issued?: { "date-parts"?: number[][] };
    type?: string;
    DOI?: string;
    ISBN?: string;
    URL?: string;
    volume?: string;
    issue?: string;
    page?: string;
    ["container-title"]?: string;
    edition?: string;
    accessed?: { "date-parts"?: number[][] };
  }

  interface CiteOptions {
    format?: string;
    type?: string;
    style?: string;
    lang?: string;
  }

  class Cite {
    constructor(input: string, options?: CiteOptions);
    data: CiteData[];
    format(style: string, options?: Record<string, unknown>): string;
  }

  export default Cite;
}
