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
            const { checksum, modulo, totalSum } = calculateArithmeticChecksum(inputText);
            const uid = generateUUID();

            storeData(uid, inputText, checksum);
            const asciiCodes = getAsciiCodes(inputText);
            $("#result").html(`ASCII Codes: ${asciiCodes} <br> Total Sum of ASCII = ${totalSum} <br> Checksum: ${totalSum} mod ${modulo} = ${checksum}`);
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
            const { checksum: recalculatedChecksum } = calculateArithmeticChecksum(retrievedData.rawText);

            if (recalculatedChecksum === retrievedData.checksum) {
                retrievedDataElement.html(`Retrieved data successfully: ${retrievedData.rawText}`);
            } else {
                retrievedDataElement.html(`Data corrupted`);
            }
        } else {
            retrievedDataElement.html("Error: No data found for the provided UID.");
        }

        $(this).find("input[type='text']").val("");
    });

    function calculateArithmeticChecksum(text) {
        let sum = 0;

        for (let i = 0; i < text.length; i++) {
            sum += text.charCodeAt(i);
        }

        const modulo = 256;
        const checksum = sum % modulo;

        return { checksum, modulo, totalSum: sum };
    }

    function getAsciiCodes(text) {
        return text
            .split("")
            .map((char) => `${char}: ${char.charCodeAt(0)}`)
            .join(", ");
    }

    function generateUUID() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
    }

    function storeData(uid, rawText, checksum) {
        const storedData = JSON.parse(localStorage.getItem("checksumData")) || [];

        storedData.push({ uid, rawText, checksum });

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
                </tr>
            `);
        });
    }
});
