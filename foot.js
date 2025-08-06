
function makePDF(data) {
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
    var logoFontSize = 34;

    var textFontSize = 14;
    var urlTop = logoTop + logoFontSize;
    var emailTop = urlTop + textFontSize*1.5;
    var tgTop = emailTop + textFontSize*1.5;

    var tableTop = tgTop + textFontSize + textFontSize*1.5;
    var tableLine = tableTop + textFontSize*0.5;
    var tableBody = tableTop + textFontSize*2;

    doc.setFont('IBMPlexSans-Bold', 'bold');    
    doc.setFontSize(logoFontSize);
    doc.text('Search&Hire', marginLeft, logoTop);

    doc.setFontSize(textFontSize);
    doc.setFont('PTSans-Regular', 'normal');
    doc.textWithLink(
        "search-hire.com", marginLeft, urlTop, {
            "url": "https://search-hire.com/",
        })
    doc.textWithLink(
        "hello@search-hire.com", marginLeft, emailTop, {
            "url": "mailto:hello@search-hire.com",
        })
    doc.textWithLink(
        "t.me/search_and_hire", marginLeft, tgTop, {
            "url": "https://t.me/search_and_hire",
        })

    var col1 = 0;
    var col2 = 150;
    var col3 = 300;
    var headers = [['Месяц', col1], ['gross', col2], ['net', col3]];
    for (let h = 0; h < headers.length; h++) {
        doc.text(headers[h][0], marginLeft + headers[h][1], tableTop)
    }

    doc.line(marginLeft, tableLine, width - marginRight, tableLine)

    doc.setFont('PTSans-Regular', 'normal');

    var grossSum = new Decimal(0);
    var netSum = new Decimal(0);
    for (let i = 0; i < data.length; i++) {
        var gross = toRuMoney(data[i]['gross']);
        var net = toRuMoney(data[i]['net']);

        grossSum = grossSum.plus(data[i]['gross']);
        netSum = netSum.plus(data[i]['net']);
        var row = [[arr[i], col1], [gross, col2], [net, col3]];
        for (let h = 0; h < row.length; h++) {
            doc.text(row[h][0], marginLeft + row[h][1], tableBody + 1.5*i * textFontSize);
        }
    }

    doc.line(marginLeft, tableBody + 1.5*(data.length-1) * textFontSize + textFontSize*0.5, width - marginRight,
      tableBody + 1.5*(data.length-1) * textFontSize + textFontSize*0.5)

    doc.text("Итого", marginLeft + row[0][1], tableBody + 1.5*data.length * textFontSize + 0.5* textFontSize);
    doc.text(toRuMoney(grossSum), marginLeft + row[1][1], tableBody + 1.5*data.length * textFontSize + 0.5* textFontSize);
    doc.text(toRuMoney(netSum), marginLeft + row[2][1], tableBody + 1.5*data.length * textFontSize + 0.5* textFontSize);

    return doc
}
function generatePDF() {
    var doc = makePDF(data);

    window.open(doc.output("bloburi"));
}

function printToPDF() {
    var doc = makePDF(data);

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

        var alert = document.getElementById('alert-ulr-copied')
        alert.removeAttribute('hidden')
        setTimeout(function(){
            alert.setAttribute('hidden', '');
        }, 10*1000);
    } catch (err) {
        console.error('Failed to copy URL: ', err);
    }
}
document.getElementById("copy-url").addEventListener('click', copyCurrentUrlToClipboard);