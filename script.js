const socket = io.connect();

const MIN_USER_LENGTH = 3;

const nickname = $('.login-form #nickname');
const loginForm = $('.login-form');
const messageForm = $('.message-form');
const messageList = $('#message-list');
const message = $('.message-form #message');
const noMessages = $('.messages-list .no-messages');
const messageFormContainer = $('.message-form-container');
const messagesList = $('.messages-list');
const usersList = $('.users-list');
const userList = $('#user-list');
const body = $('body');

function showAlert(text="Alert text", type="info", duration=3000) {
    let background = "linear-gradient(to right, #007bff, #02aef7)";

    switch (type) {
        case "success":
            background = "linear-gradient(to right, #00b09b, #96c93d)";
            break;
        case "danger":
            background = "linear-gradient(to right, #6e0202, #f70202)";
            break;
    }

    Toastify({
        text,
        duration,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background
        },
        onClick: function(){} // Callback after click
    }).showToast();
}

function hideLoginForm() {
    // body[0].classList.remove('overflow-hidden');
    loginForm[0].classList.remove('d-flex');
    loginForm[0].classList.add('d-none');
    // body[0].classList.add('overflow-auto');
}

$(document).ready(() => {
    loginForm.submit(e => {
        e.preventDefault();
        if (nickname.val().length >= MIN_USER_LENGTH) {
            socket.emit('login', nickname.val());
        }
        else {
            showAlert(`User name should be at least ${MIN_USER_LENGTH} char length`, "danger", 3000);
        }
    });

    messageForm.submit(e => {
        e.preventDefault();
        if (message.val().length) {
            socket.emit('message', message.val());
            message.val('');
        }
        else {
            showAlert("Please, enter at least something", "danger", 3000);
        }
    })

    socket.on('login', (data) => {
        if (data.status === 'OK') {
            hideLoginForm();
            messageFormContainer.show();
            messagesList.show();
            usersList.show();
            showAlert("Log in again as another user in a new tab to be able to chat!", "info", -1);
            showAlert("You successfully logged in it!", "success", 3000);
        }
        else {
            showAlert("This user already in system! Please select another one.", "danger", 3000);
        }
    });

    socket.on('new message', (data) => {
        const newMessage = `<a href="#" class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1 overflow-hidden text-truncate">${data.user}</h5>
                <small class="text-muted">${moment(data.time).format("h:mm a, dddd, Do MMMM YYYY")}</small>
            </div>
            <p class="mb-1 text-break">${data.message}</p>
        </a>`;
        noMessages.hide();
        messageList.prepend(newMessage);
    });

    socket.on('users', (data) => {
        userList.html('');
        for (let i = 0; i < data.users.length; i++) {
            userList.append(`
                <li class="list-group-item d-flex justify-content-between">
                    <span class="overflow-hidden text-truncate">${data.users[i]}</span>
                    <span>🟢</span>
                </li>`
            );
        }
    })
})