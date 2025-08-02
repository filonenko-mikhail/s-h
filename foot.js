
function makePDF() {
    var { jsPDF } = window.jspdf;
    window.html2canvas = html2canvas;
    var doc = new jsPDF('p', 'pt', 'a4');
    console.log(doc.getFontList());

    var width = 595;
    var height = 842;

    var marginTop = 54;
    var marginLeft = 54;
    var marginRight = 54;
    
    var logoTop = marginTop;

    var tableTop = 124;
    var tableLine = tableTop + 14/2;
    var tableBody = tableTop + 14/2 + 14;

    doc.setFont('IBMPlexSans-Bold', 'bold');    
    doc.setFontSize(34);

    var fontSize = doc.getFontSize();
    doc.text('Search&Hire', marginLeft, logoTop);

    doc.setFontSize(14);
    var fontSize = doc.getFontSize();
    doc.setFont('PTSans-Regular', 'normal');

    doc.textWithLink(
        "search-hire.com", width/2, logoTop, {
            "url": "https://search-hire.com/",
        })
    
    doc.textWithLink(
        "hello@search-hire.com", width/2, logoTop + 14, {
            "url": "mailto:hello@search-hire.com",
        })

    doc.textWithLink(
        "t.me/search_and_hire", width/2, logoTop + 14 + 14, {
            "url": "https://t.me/search_and_hire",
        })

    var col1 = 0;
    var col2 = 100;
    var col3 = 200;
    var headers = [['Месяц', col1], ['gross', col2], ['net', col3]];
    for (let h = 0; h < headers.length; h++) {
        doc.text(headers[h][0], marginLeft + headers[h][1], tableTop)
    }

    doc.line(marginLeft, tableLine, width - marginRight, tableLine)

    doc.setFont('PTSans-Regular', 'normal');
    for (let i = 0; i < data.length; i++) {
        var gross = removeSuffix(data[i]['gross'].toFixed(2), '.00') + '₽';
        var net = removeSuffix(data[i]['net'].toFixed(2), '.00') + '₽';

        var row = [[arr[i], col1], [gross, col2], [net, col3]];
        for (let h = 0; h < row.length; h++) {
            doc.text(row[h][0], marginLeft + row[h][1], tableBody + 1.5*i * fontSize);
        }
    }

    return doc
}
function generatePDF() {
    var doc = makePDF()

    window.open(doc.output("bloburi"));
}

function printToPDF() {
    var doc = makePDF()

    // you can generate in another format also  like blob
    var out = doc.output('blob');
    var reader = new FileReader();

    reader.readAsDataURL(out);
    reader.onloadend = function () { // for blob to base64
        base64data = reader.result;
        var base64result = reader.result.substr(reader.result.indexOf(',') + 1);
        
        printJS({ printable: base64result, type: 'pdf', base64: true })
    }
    reader.onerror = function() {
        alert("error while printing");
    }
}

document.getElementById("generate-pdf").addEventListener('click', generatePDF);

document.getElementById("print").addEventListener('click', printToPDF);
async function copyCurrentUrlToClipboard() {
    try {
        // Get the current URL
        const url = window.location.href;

        // Write the URL to the clipboard
        await navigator.clipboard.writeText(url);
        console.log('Current URL copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy URL: ', err);
    }
}
document.getElementById("copy-url").addEventListener('click', copyCurrentUrlToClipboard);