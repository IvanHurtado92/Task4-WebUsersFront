document.addEventListener('DOMContentLoaded', function() {
    // const apiURL = "https://user-data-api-hjawh4acgdf3ewhg.mexicocentral-01.azurewebsites.net/api/" // API REAL
    const apiURL = "https://localhost:7150/api/" // API TESTING
    const loginForm = document.getElementById('loginForm');
    const accountInput = document.getElementById('name');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = togglePassword.querySelector('i');
    
    const delay = ms => new Promise(res => setTimeout(res, ms));

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
        
        // Check form validity
        if (!loginForm.checkValidity()) {
            event.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }
        
        // Get form values
        const accName = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Join data in Object

        const data = {
            "name":accName,
            "email":email,
            "password":password
        }
        
        registerUser(data);
    });
    
    // Real-time validation
    const emailInput = document.getElementById('email');
    accountInput.addEventListener('input', validateAccount);
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    
    function validateAccount() {
        if (accountInput.validity.valid) {
            accountInput.classList.remove('is-invalid');
            accountInput.classList.add('is-valid');
        } else {
            accountInput.classList.remove('is-valid');
            accountInput.classList.add('is-invalid');
        }
    }

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

    async function registerUser(data) {
        // Simulate login process
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating Account...';
        submitBtn.disabled = true;

        const alertBoxGood = document.getElementById('authAlertGood');
        const alertBoxBad = document.getElementById('authAlertBad');
        const alertTextGood = document.getElementById('alertTextGood');
        const alertTextBad = document.getElementById('alertTextBad');
        alertBoxGood.classList.add('d-none'); // Hide it initially
        alertBoxBad.classList.add('d-none'); 

        try{
            const response = await fetch(`${apiURL}User/CreateUser`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if(!response.ok){
                const failReason = await response.json();
                showAlert(failReason.data,alertBoxBad,alertTextBad);
            }
            else{
                showAlert("Account created!",alertBoxGood,alertTextGood)
                await delay(3000);
                location.replace("index.html")
            }
        }
        catch(error){
            showAlert(error.message,alertBoxBad,alertTextBad);    
        }

        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Reset form
        loginForm.reset();
        loginForm.classList.remove('was-validated');
        
        // Reset password visibility
        passwordInput.setAttribute('type', 'password');
        eyeIcon.classList.remove('bi-eye-slash');
        eyeIcon.classList.add('bi-eye');
    }
});

function showAlert(message,alertBox,alertText) {

    alertText.textContent = message;
    alertBox.classList.remove('d-none');

    // Auto-hide after 4 seconds
    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 3000);
}