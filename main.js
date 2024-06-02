import data from "./data/result.json" assert { type: "json" };
const PDFDocument = require("pdfkit");
const fs = require("fs");
const sizeOf = require("image-size");

let messages = [];
let messagesRaw = data["messages"];
console.log("> Parsing Telegram Data...");
for (var k = 0; k < messagesRaw.length; k++) {
    if (messagesRaw[k]["type"] == "message") {
        messages.push(messagesRaw[k]);
    }
}
console.log(
    `> Parsed Telegram Data --- Found ${messagesRaw.length} total messages.`
);

let filteredMessagesUncleansed = [];
let tags = [
    "plain",
    "hashtag",
    "mention",
    "link",
    "bold",
    "italic",
    "text_link",
    "cashtag",
    "custom_emoji",
    "code",
    "underline",
    "strikethrough",
    "email",
    "blockquote",
    "pre",
    "phone",
    "mention_name",
];
function getNMessages(numberOfMessages) {
    console.log("> Filtering User Messages...");
    for (var i = 0; i < numberOfMessages; i++) {
        let currentMessage = "";
        for (var j = 0; j < messages[i]["text_entities"].length; j++) {
            let currentTag = messages[i]["text_entities"][j]["type"];
            let curText = messages[i]["text_entities"][j]["text"].toString();
            if (tags.includes(currentTag) == true) {
                currentMessage += curText;
            }
        }
        if (currentMessage.length > 0) {
            let newLineRemoved = currentMessage.replaceAll("\n", " ");

            try {
                if (
                    messages[i]["photo"] !== undefined &&
                    messages[i]["photo"] !== "undefined"
                ) {
                    filteredMessagesUncleansed.push(messages[i]["photo"]);
                }
            } catch (error) {}
            filteredMessagesUncleansed.push(newLineRemoved.trim());
        }
    }
    console.log(
        `> Filtered User Messages! --- Found ${messages.length} user messages.`
    );
}

var fontSize = 11; //12;
var marginTop = 20; //30;
var marginBottom = 20; //30;
var marginLeft = 25; //35;
var marginRight = 25; //35;
function createPDF(sentences, outputPath) {
    console.log("> Creating PDF...");

    const doc = new PDFDocument({
        margins: {
            top: marginTop, // 30
            bottom: marginBottom, // 30
            left: marginLeft, // 35
            right: marginRight, // 35
        },
    });

    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // USER MESSAGES
    console.log("> PDF Created!");
    console.log("> Writing to PDF...");
    sentences.forEach((sentence, index) => {
        if (sentence.toString().substring(0, 7) == "photos/") {
            // Add an image, constrain it to a given size, and center it vertically and horizontally
            var imageURL = `./data/${sentence}`;
            const dimensions = sizeOf(imageURL);
            console.log(dimensions.height);
            doc.image(imageURL, {
                fit: [dimensions.width / 4, dimensions.height / 4],
                align: "center",
                valign: "center",
            });
            // Add space
            var spaceSize = "";
            if (dimensions.height < 450) {
                spaceSize = "\n\n\n\n\n\n\n\n\n";
            } else if (dimensions.height < 500) {
                spaceSize = "\n\n\n\n\n";
            } else if (dimensions.height < 750) {
                spaceSize = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
            } else if (dimensions.height < 1000) {
                spaceSize = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
            } else if (dimensions.height < 1300) {
                spaceSize =
                    "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
            }
            doc.font("./font/UbuntuSans-Medium.ttf") // 'Times-Roman'
                .fontSize(fontSize) // 12
                .text(spaceSize, {
                    width: 530, // 530
                    align: "left",
                    indent: 0,
                });
        } else {
            // Add the sentence to PDF with proper text wrapping
            doc.font("./font/UbuntuSans-Medium.ttf") // 'Times-Roman'
                .fontSize(fontSize) // 12
                .text(`${sentence}\n`, {
                    width: 530, // 530
                    align: "left",
                    indent: 0,
                });

            doc.font("./font/UbuntuSans-Medium.ttf") // 'Times-Roman'
                .fontSize(fontSize) // 12
                .text("\n", {
                    width: 530, // 530
                    align: "left",
                    indent: 0,
                });
        }
    });

    // Finalize the PDF
    doc.end();
    console.log("> Done writing to PDF!");
    console.log(`> PDF Created at ${outputPath}.`);
    console.log("> Done!");
}

getNMessages(messages.length);

let wrapped = filteredMessagesUncleansed;
let unwrapped = [filteredMessagesUncleansed.join(" ")];

createPDF(wrapped, "./output/DBWImages.pdf");
