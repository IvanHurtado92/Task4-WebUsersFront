document.addEventListener('DOMContentLoaded', function() {
    // const apiURL = "https://user-data-api-hjawh4acgdf3ewhg.mexicocentral-01.azurewebsites.net/api/" // API REAL
    const apiURL = "https://localhost:7150/api/" // API TESTING
    const loginForm = document.getElementById('loginForm');
    
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
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
        const email = document.getElementById('email').value;
        
        // Join data in Object

        const data = {
            "email":email
        }
        
        registerUser(data);
    });
    
    // Real-time validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('input', validateEmail);

    function validateEmail() {
        if (emailInput.validity.valid) {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
        } else {
            emailInput.classList.remove('is-valid');
            emailInput.classList.add('is-invalid');
        }
    }

    async function registerUser(data) {
        // Simulate login process
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
        submitBtn.disabled = true;

        const alertBoxGood = document.getElementById('authAlertGood');
        const alertBoxBad = document.getElementById('authAlertBad');
        const alertTextGood = document.getElementById('alertTextGood');
        const alertTextBad = document.getElementById('alertTextBad');
        alertBoxGood.classList.add('d-none'); // Hide it initially
        alertBoxBad.classList.add('d-none'); 

        try{
            const response = await fetch(`${apiURL}User/GetPassword`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if(!response.ok){
                showAlert(result.data,alertBoxBad,alertTextBad);
            }
            else{
                showAlert(`Password: ${result.data}`,alertBoxGood,alertTextGood)
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