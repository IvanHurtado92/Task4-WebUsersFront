document.addEventListener('DOMContentLoaded', function() {
    const apiURL = "https://user-data-api-hjawh4acgdf3ewhg.mexicocentral-01.azurewebsites.net/api/" // API REAL
    // const apiURL = "https://localhost:7150/api/" // API TESTING
    const loginForm = document.getElementById('loginForm');
    
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!loginForm.checkValidity()) {
            event.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }
        
        const email = document.getElementById('email').value;

        const data = {
            "email":email
        }
        
        recoverPass(data);
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

    async function recoverPass(data) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
        submitBtn.disabled = true;

        const alertBox = document.getElementById('authAlert');
        const alertText = document.getElementById('alertText');
        alertBox.classList.add('d-none'); // Hide it initially

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
                showAlert(result.data,false);
            }
            else{
                showAlert(`Password: ${result.data}`,true)
            }
        }
        catch(error){
            showAlert("Unable to access server",false);    
        }

        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        emailInput.classList.remove('is-valid', 'is-invalid');

        loginForm.reset();
        loginForm.classList.remove('was-validated');
    }
});

function showAlert(message, isSuccess = false) {
    const alertBox = document.getElementById('authAlert');
    const alertText = document.getElementById('alertText');

    alertText.textContent = message;

    if (isSuccess) {
        alertBox.classList.remove('alert-danger');
        alertBox.classList.add('alert-success');
        const svgUse = alertBox.querySelector('svg use');
        if (svgUse) {
            svgUse.setAttribute('xlink:href', '#check-circle-fill');
        }
    } else {
        alertBox.classList.remove('alert-success');
        alertBox.classList.add('alert-danger');
        const svgUse = alertBox.querySelector('svg use');
        if (svgUse) {
            svgUse.setAttribute('xlink:href', '#exclamation-triangle-fill');
        }
    }

    alertBox.classList.remove('d-none');

    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 3000);
}