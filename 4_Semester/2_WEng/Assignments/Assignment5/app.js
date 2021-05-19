
function getMessages() {
    axios.get("https://weng-message-board.herokuapp.com/api/messages/")
        .then(response => {
            let html = "";
            let messages = response.data

/*             // create a list item for each message
            for (let m of messages) {
                html += "<li>" + m.message + "</li>";
            }
            document.getElementById("message-list").innerHTML = html;
            html = ""; */

            // create a table row for each message in reverse order (latest message on top)
            for (let i = messages.length - 1; i >= 0; i--) {
                html += "<tr>";
                html += "<td>" + messages[i].timestamp + "</td>";
                html += "<td>" + messages[i].message + "</td>";
                html += "<td>" + messages[i].sender + "</td>";
                html += "</tr>";
            }

            document.getElementById("messages").innerHTML = html;
        })
        .catch( error => {
            alert("Could not receive messages.")
        })
}

// get all messages automatically when the page is loaded
getMessages();

function sendMessage() {
    let data = {
        message: document.getElementById("message").value,
        sender: "Max"
    }
    axios.post("https://weng-message-board.herokuapp.com/api/messages/", data)
        .then(response => {
            alert("Message has been sent.");
            getMessages();
        })
        .catch( error => {
            alert("Message could not be sent.")
        })
}