import data from "./data/result.json"  assert { type: "json" };
const PDFDocument = require('pdfkit');
const fs = require('fs');

let messages = []
let messagesRaw = data["messages"];
console.log("> Parsing Telegram Data...")
for(var k = 0; k < messagesRaw.length; k++){
    if (messagesRaw[k]["type"] == "message"){
        messages.push(messagesRaw[k])
    }
}
console.log(`> Parsed Telegram Data --- Found ${messagesRaw.length} total messages.`)


let filteredMessagesUncleansed = []
let tags = ["plain","hashtag", "mention", "link", "bold", "italic", "text_link", "cashtag","custom_emoji","code","underline","strikethrough","email","blockquote","pre","phone","mention_name"]
function getNMessages(numberOfMessages) {
    console.log("> Filtering User Messages...")
    for(var i = 0; i < numberOfMessages; i++){
        let currentMessage = "";
        for(var j = 0; j < messages[i]["text_entities"].length; j++){
            let currentTag = messages[i]["text_entities"][j]["type"];
            let curText = messages[i]["text_entities"][j]["text"].toString()
            if (tags.includes(currentTag) == true){
                currentMessage += curText
            }
        }
        if(currentMessage.length > 0) {
            let newLineRemoved = currentMessage.replaceAll("\n", " ")
            filteredMessagesUncleansed.push(newLineRemoved.trim())
        }
    }
    console.log(`> Filtered User Messages! --- Found ${messages.length} user messages.`)
}


function createPDF(sentences, outputPath) {
    console.log("> Creating PDF...")

    const doc = new PDFDocument({
        margins: {
            top: 30, // 30
            bottom: 30, // 30
            left: 35, // 35
            right: 35 // 35
        }
    });

    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // USER MESSAGES
    console.log("> PDF Created!")
    console.log("> Writing to PDF...")
    sentences.forEach((sentence, index) => {
        // Add the sentence to PDF with proper text wrapping
        doc.font('./font/UbuntuSans-Medium.ttf') // 'Times-Roman'
           .fontSize(12) // 12
           .text(`${sentence}\n`, {
               width: 530, // 530
               align: 'left',
               indent: 0,
           });

        doc.font('./font/UbuntuSans-Medium.ttf') // 'Times-Roman'
           .fontSize(12) // 12
           .text("\n", {
               width: 530, // 530
               align: 'left',
               indent: 0,
           });

    });

    // Finalize the PDF
    doc.end();
    console.log("> Done writing to PDF!")
    console.log(`> PDF Created at ${outputPath}.`);
    console.log("> Done!")
}

getNMessages(messages.length)

let wrapped = filteredMessagesUncleansed;
let unwrapped = [filteredMessagesUncleansed.join(" ")]

createPDF(wrapped, './output/DagmawiBabiFont.pdf')

