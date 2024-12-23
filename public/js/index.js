document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');


    function showForm(form) {
        if (form === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }

    // Check if there's a registration message
    if (registerMessage && registerMessage.querySelector('p')) {
        showForm('register');
    } else if (loginMessage && loginMessage.querySelector('p')) {
        showForm('login');
    } else {
        showForm('login'); // Default to login if no message
    }


    // Add event listeners
    loginTab.addEventListener('click', function() {
        showForm('login');
    });

    registerTab.addEventListener('click', function() {
        showForm('register');
    });
});



