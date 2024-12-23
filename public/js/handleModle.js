// Get the isLoggedIn value from the body data attribute
const isLoggedIn = document.body.getAttribute('data-is-logged-in') === 'true';

// Get the modal
const newAdminModal = document.getElementById("newAdminModal");

// Get the button that opens the modal
const addAdminBtn = document.querySelector("a[href='/AddAdmin']");

// Get the <span> element that closes the modal
const closePopup = document.getElementsByClassName("popup-close")[0];


// Check if there is a message to display
const messageElement = document.querySelector(".message-alert");
// If there's a message, show the modal
if (messageElement && messageElement.textContent.trim() !== '') {
    newAdminModal.style.display = "block";
}

// When the user clicks the button, open the modal or redirect if not logged in
addAdminBtn.onclick = function(event) {
    event.preventDefault(); // Prevent the default link behavior
    if (isLoggedIn) {
        newAdminModal.style.display = "block";
    } else {
        window.location.href = "/";
    }
}

// When the user clicks on <span> (x), close the modal
closePopup.onclick = function() {
    newAdminModal.style.display = "none";
    messageElement.textContent='';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == newAdminModal) {
        newAdminModal.style.display = "none";
    }
}
