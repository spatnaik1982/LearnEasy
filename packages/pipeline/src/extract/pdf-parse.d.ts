declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
  }
  function pdfParse(
    dataBuffer: Buffer,
    options?: { pagerender?: (pageData: { pageIndex: number; numPages: number }) => string },
  ): Promise<PDFData>;
  export default pdfParse;
}
