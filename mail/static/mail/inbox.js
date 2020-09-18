document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => { load_mailbox('inbox') });
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#inbox2').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent2').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived2').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose2').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function display(object) {
    const li = document.createElement('li');
    li.innerHTML = `<h5>${object.sender} : ${object.subject}</h5>`;
    document.querySelector('#email-data').append(li);
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    //history.pushState({ mailbox: mailbox }, "", `emails/${mailbox}`);
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<center><h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><center><hr>`;

    if (window.matchMedia("(min-width: 1000px)").matches) {
        /* The viewport is less than, or equal to, 700 pixels wide */
        slice1 = 20;
        slice2 = 30;
        slice3 = 25;
        slice4 = 20;
    } else if (window.matchMedia("(max-width: 1000px)").matches) {
        /* The viewport is greater than 700 pixels wide */
        slice1 = 8;
        slice2 = 10;
        slice3 = 0;
        slice4 = 5;
    }

    fetch(`/emails/${mailbox}`)
        .then((response) => response.json())
        .then((emails) => {
            emails.forEach((mail) => {
                if (mailbox != "sent") {
                    user = mail.sender;
                } else {
                    user = mail.recipients;
                }
                readstatus = mail.read;
                var item = document.createElement("div");
                item.className = `card   ${readstatus}`;
                if (!readstatus && mailbox != "sent") {
                    var font = 'bold';
                    item.style.background = 'rgba(225,450,235,0.5)';
                } else {
                    var font = 'normal';
                    item.style.background = 'rgba(255,250,245,0.5)';
                }
                item.innerHTML = `<div class="mydiv"><div class="card-body d-flex p-2 bd-highlight border-secondary" id="item-${mail.id}" style="font-weight:${font};opacity:'1';border-radius: 20px;">
                <div class="p-2 bd-highlight justify-content-start">${user.slice(0,slice1)}...</div>
                <div class="p-2 bd-highlight ml-auto justify-content-start">${mail.subject.slice(0, slice2)}...</div>
                <div class="p-2 bd-highlight  ml-auto ">${mail.body.slice(0, slice3)}...</div> 
                <div class="p-2 bd-highlight justify-content-end ml-auto">${mail.timestamp.slice(0,slice4)}</div> 
                  
      </div></div>`;
                document.querySelector("#emails-view").appendChild(item);
                item.addEventListener("click", () => {
                    show_mail(mail.id, mailbox);
                });
            });
        });
}


function show_mail(id, mailbox) {
    fetch(`/emails/${id}`)
        .then((response) => response.json())
        .then((email) => {
            // Print email
            // console.log(email);
            document.querySelector("#emails-view").innerHTML = `<center><img src="${email.senderpicture}" class="rounded-circle" width=50px> : <strong style="font-size:24px">${email.subject}</strong><center><hr>`;
            var item = document.createElement("div");
            item.className = `card`;
            item.innerHTML = `
            <div class="card-body streched-link" style="background:rgba(255,250,250,0.5);min-height="100%";>
                <div class="card-text">
                <cite>From: </cite>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong style="font-size:17px">${email.sendername}</strong>(${email.sender})<br>
                <cite>To: </cite>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong style="font-size:17px">${email.recipients}</strong>(${email.recipients})<br>
                <cite>Subject:&nbsp;&nbsp;</cite> ${email.subject}<br>
                <cite>Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</cite> ${email.timestamp}<br>
                </div>
                <hr>
                <div style="text-align: justify;text-justify: inter-word;white-space:pre-wrap;">${email.body}</div>
            </div>`;
            document.querySelector("#emails-view").appendChild(item);
            if (mailbox == "sent") return;
            //Reply Button
            let reply = document.createElement("button");
            reply.className = `btn btn-outline-success m-2`;
            reply.textContent = "Reply";
            reply.addEventListener("click", () => {
                send(email.sender, email.subject, email.body, email.timestamp);
            });
            document.querySelector("#emails-view").appendChild(reply);

            //Forward button
            let forward = document.createElement("button");
            forward.className = `btn btn-outline-primary m-2`;
            forward.textContent = "Forward";
            forward.addEventListener("click", () => {
                forwardmail(email.sender, email.subject, email.body, email.timestamp);
            });
            document.querySelector("#emails-view").appendChild(forward);

            //Archive button
            let archive = document.createElement("button");
            archive.className = `btn btn-outline-warning mr-auto m-2`;
            archive.addEventListener("click", () => {
                toggle_archive(id, email.archived);
                if (archive.innerText == "Archive") archive.innerText = "Remove from Archive";
                else archive.innerText = "Archive";
            });
            if (!email.archived) archive.textContent = "Archive";
            else archive.textContent = "Remove from Archive";
            document.querySelector("#emails-view").appendChild(archive);





            read(id);
        });
}

function toggle_archive(id, state) {
    fetch(`/emails/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            archived: !state,
        }),
    });
}


function read(id) {
    fetch(`/emails/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            read: true,
        }),
    });
}



function send(sender, subject, body, timestamp) {
    compose_email();
    if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
    document.querySelector("#compose-recipients").value = sender;
    document.querySelector("#compose-subject").value = subject;

    quote = `\n\n\n\n--------------------\nOn ${timestamp}, (${sender}) wrote:\n${body}\n`;

    document.querySelector("#compose-body").value = quote;
}

function forwardmail(sender, subject, body, timestamp) {
    compose_email();
    if (!/^Fwd:/.test(subject)) subject = `Fwd: ${subject}`;
    document.querySelector("#compose-subject").value = subject;
    document.querySelector("#compose-recipients").value = "";
    quote = `\n\n\n\n--------------------\nOn ${timestamp}, (${sender}) wrote:\n${body}\n`;
    document.querySelector("#compose-body").value = quote;
}