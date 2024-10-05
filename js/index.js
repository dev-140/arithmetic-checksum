$(document).ready(function () {
    // UI functions
    $(".navigation-btn").on("click", (e) => {
        var $this = $(e.currentTarget);
        $(".navigation-btn").removeClass("active");
        $this.addClass("active");

        var currContainer = $this.attr("data-container");
        $(".main-view-container").addClass("d-none");
        $(currContainer).removeClass("d-none");

        if (currContainer === ".view-data-container") {
            displayAllStoredData();
        }
    });

    // Add data function
    $("#myForm").on("submit", function (event) {
        event.preventDefault();

        const inputText = $("input").val();
        if (inputText) {
            const { binaryData, checksum, fullBinaryWithChecksum, charBinaries, binarySum, packets } = calculateChecksum(inputText);
            const uid = generateUID();

            storeData(uid, inputText, binaryData, checksum, fullBinaryWithChecksum);

            let resultHTML = "<h4>Input Text: " + inputText + "</h4>";
            resultHTML += "<div class='table-add-main'><table class='table'><thead><tr><th>Character</th><th>Binary</th></tr></thead><tbody>";

            for (let i = 0; i < inputText.length; i++) {
                resultHTML += `<tr><td>${inputText[i]}</td><td>${charBinaries[i]}</td></tr>`;
            }

            resultHTML += `</tbody></table></div>`;
            resultHTML += `<p>Binary: ${binaryData}</p>`;
            resultHTML += `<p>Binary Packets: ${packets.join(", ")}</p>`;
            resultHTML += `<p>Sum of Binary Packets: ${binarySum}</p>`;
            resultHTML += `<p>Checksum (1's complement): ${checksum}</p>`;
            resultHTML += `<p>Full Binary with Checksum: ${fullBinaryWithChecksum}</p>`;

            $("#result").html(resultHTML);
            $("input").val("");
        }
    });

    // Retrieve data function
    $("#getID").on("submit", function (event) {
        event.preventDefault();

        const inputUID = $(this).find("input[type='text']").val();
        const storedData = JSON.parse(localStorage.getItem("checksumData")) || [];

        const retrievedData = storedData.find((data) => data.uid === inputUID);

        const retrievedDataElement = $("#retrieved-data");
        if (retrievedData) {
            const { checksum: recalculatedChecksum } = calculateChecksum(retrievedData.rawText);

            if (recalculatedChecksum === retrievedData.checksum) {
                retrievedDataElement.html(`Retrieved data successfully:<br>
                                           Raw Text: ${retrievedData.rawText}<br>
                                           Binary Data: ${retrievedData.binaryData}<br>
                                           Stored Checksum: ${retrievedData.checksum}<br>
                                           Recalculated Checksum: ${recalculatedChecksum}<br>
                                           Full Binary with Checksum: ${retrievedData.fullBinaryWithChecksum}`);
            } else {
                retrievedDataElement.html(`Data corrupted. Stored Checksum: ${retrievedData.checksum}, Recalculated Checksum: ${recalculatedChecksum}`);
            }
        } else {
            retrievedDataElement.html("Error: No data found for the provided UID.");
        }

        $(this).find("input[type='text']").val("");
    });

    // Function to calculate checksum and manage packets
    function calculateChecksum(text) {
        const charBinaries = text.split("").map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"));
        const binaryData = charBinaries.join("");
        const binaryLength = binaryData.length;

        // Determine number of packets based on binary length
        let packetCount;
        if (binaryLength <= 40) {
            packetCount = 4;
        } else if (binaryLength <= 80) {
            packetCount = 2;
        } else {
            packetCount = 8;
        }

        const packetSize = Math.ceil(binaryLength / packetCount);
        const packets = [];

        // Create binary packets
        for (let i = 0; i < binaryLength; i += packetSize) {
            packets.push(binaryData.slice(i, i + packetSize));
        }

        // Sum the binary packets
        const binarySum = packets
            .reduce((acc, packet) => {
                return acc + parseInt(packet, 2);
            }, 0)
            .toString(2);

        // Calculate checksum
        const checksum = binarySum
            .split("")
            .map((bit) => (bit === "0" ? "1" : "0"))
            .join("");

        const fullBinaryWithChecksum = binaryData + checksum;

        return { binaryData, checksum, fullBinaryWithChecksum, charBinaries, binarySum, packets };
    }

    function generateUID() {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let uid = "";
        for (let i = 0; i < 5; i++) {
            uid += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return uid;
    }

    function storeData(uid, rawText, binaryData, checksum, fullBinaryWithChecksum) {
        const storedData = JSON.parse(localStorage.getItem("checksumData")) || [];
        storedData.push({ uid, rawText, binaryData, checksum, fullBinaryWithChecksum });
        localStorage.setItem("checksumData", JSON.stringify(storedData));
    }

    function displayAllStoredData() {
        const storedData = JSON.parse(localStorage.getItem("checksumData")) || [];
        const dataList = $("#dataList");

        dataList.empty();

        storedData.forEach((data) => {
            dataList.append(`
                <tr>
                    <td>${data.uid}</td>
                    <td>${data.rawText}</td>
                    <td>${data.checksum}</td>
                    <td>${data.fullBinaryWithChecksum}</td>
                </tr>
            `);
        });
    }

    // Update data function (only updates raw text without recalculating checksum)
    $("#updateData").on("submit", function (event) {
        event.preventDefault();

        const inputUID = $(this).find("input[aria-label='UID']").val();
        const newRawText = $(this).find("input[aria-label='Data']").val();
        let storedData = JSON.parse(localStorage.getItem("checksumData")) || [];

        const dataIndex = storedData.findIndex((data) => data.uid === inputUID);

        if (dataIndex !== -1) {
            storedData[dataIndex].rawText = newRawText;

            localStorage.setItem("checksumData", JSON.stringify(storedData));

            alert(`Raw text for UID ${inputUID} updated. Note: Checksum was not recalculated for testing.`);
        } else {
            alert(`Error: No data found for the provided UID.`);
        }

        $(this).find("input").val("");
    });
});
