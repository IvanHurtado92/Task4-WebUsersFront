document.addEventListener('DOMContentLoaded', function() {
    const apiURL = "https://user-data-api-hjawh4acgdf3ewhg.mexicocentral-01.azurewebsites.net/api/" // API REAL
    // const apiURL = "https://localhost:7150/api/" // API TESTING
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = togglePassword.querySelector('i');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        if (type === 'text') {
            eyeIcon.classList.remove('bi-eye');
            eyeIcon.classList.add('bi-eye-slash');
        } else {
            eyeIcon.classList.remove('bi-eye-slash');
            eyeIcon.classList.add('bi-eye');
        }
    });
    
    // Form validation and submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!loginForm.checkValidity()) {
            event.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const data = {
            "email":email,
            "password":password
        }
        
        authenticateUser(data);
    });
    
    // Real-time validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    
    function validateEmail() {
        if (emailInput.validity.valid) {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
        } else {
            emailInput.classList.remove('is-valid');
            emailInput.classList.add('is-invalid');
        }
    }
    
    function validatePassword() {
        if (passwordInput.validity.valid) {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
        } else {
            passwordInput.classList.remove('is-valid');
            passwordInput.classList.add('is-invalid');
        }
    }

    async function authenticateUser(data) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...';
        submitBtn.disabled = true;

        const alertBox = document.getElementById('authAlert');
        const alertText = document.getElementById('alertText');
        alertBox.classList.add('d-none'); // Hide it initially

        try{
            const response = await fetch(`${apiURL}LogIn/LogIn`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if(!response.ok){
                const failReason = await response.json();
                showAlert(failReason.data);
            }
            else{
                const email = document.getElementById('email').value;
                sessionStorage.setItem('email',email);
                sessionStorage.setItem('logged_in',true);
                location.replace("./../Lobby/lobby.html");
            }
        }
        catch(error){
            showAlert("Unable to access server");    
        }

        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        loginForm.reset();
        loginForm.classList.remove('was-validated');

        emailInput.classList.remove('is-valid', 'is-invalid');
        passwordInput.classList.remove('is-valid', 'is-invalid');
        
        passwordInput.setAttribute('type', 'password');
        eyeIcon.classList.remove('bi-eye-slash');
        eyeIcon.classList.add('bi-eye');
    }
});

function showAlert(message) {
    const alertBox = document.getElementById('authAlert');
    const alertText = document.getElementById('alertText');

    alertText.textContent = message;
    alertBox.classList.remove('d-none');

    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 3000);
}