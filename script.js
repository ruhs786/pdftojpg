let pdfFile = null;
let imageUrls = [];

function handleFileUpload(event) {
    pdfFile = event.target.files[0];
    document.getElementById('convertBtn').disabled = !pdfFile;
}

async function convertPDF() {
    if (!pdfFile) return;

    const format = document.getElementById('format').value;
    const dpi = parseInt(document.getElementById('dpi').value);
    const previewDiv = document.getElementById('preview');
    previewDiv.innerHTML = 'Converting...';
    imageUrls = [];

    // Load PDF
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = dpi / 72; // Adjust scale based on DPI
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convert canvas to image
        const imgData = canvas.toDataURL(format);
        imageUrls.push(imgData);

        // Display preview
        const img = document.createElement('img');
        img.src = imgData;
        previewDiv.appendChild(img);
    }

    previewDiv.innerHTML = '';
    imageUrls.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        previewDiv.appendChild(img);
    });

    document.getElementById('downloadAll').style.display = 'block';
}

function downloadAllImages() {
    imageUrls.forEach((url, index) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `page_${index + 1}.${url.split('/')[1].split(';')[0]}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
