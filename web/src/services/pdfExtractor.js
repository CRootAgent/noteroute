/**
 * Client-Side PDF Text Extractor using pdfjs-dist
 * Enables browser-only PDF text parsing on static hosts like GitHub Pages
 */
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configure worker to load from CDN fallback if local worker is not available
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.5.136'}/pdf.worker.min.mjs`;
}

export async function extractPdfText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true
    });
    
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    let fullText = '';
    const pageTexts = [];

    // Extract text page by page (up to max 40 pages to stay performant)
    const pagesToExtract = Math.min(numPages, 40);
    for (let i = 1; i <= pagesToExtract; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageStr = textContent.items
          .map((item) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageStr) {
          pageTexts.push(`[Halaman ${i}]\n${pageStr}`);
          fullText += `\n\n--- Halaman ${i} ---\n${pageStr}`;
        }
      } catch (pageErr) {
        console.warn(`[extractPdfText] Gagal mengekstrak halaman ${i}:`, pageErr.message);
      }
    }

    if (!fullText.trim()) {
      return `Teks dokumen "${file.name}" tidak mengandung lapisan teks terbaca (mungkin pindaian gambar / OCR diperlukan). Ukuran berkas: ${(file.size / 1024).toFixed(1)} KB, Total Halaman: ${numPages}.`;
    }

    return fullText.trim();
  } catch (err) {
    console.warn('[extractPdfText] Ekstraksi PDF client-side gagal:', err.message);
    return `Gagal memproses teks berkas "${file.name}" secara lokal: ${err.message}.`;
  }
}
