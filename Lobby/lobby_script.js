document.addEventListener('DOMContentLoaded', function() {

    //Redirect if not logged in
    if(!sessionStorage.getItem('logged_in')){
        logOutUser();
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));


    const userWelcome = document.getElementById('userWelcome');
    userWelcome.textContent = `Welcome ${sessionStorage.getItem('email')}`;

    const apiURL = "https://user-data-api-hjawh4acgdf3ewhg.mexicocentral-01.azurewebsites.net/api/" // API REAL
    // const apiURL = "https://localhost:7150/api/" // API TESTING

    const logoutButton = document.getElementById('logoutButton');
    const blockButton = document.getElementById('blockButton');
    const unblockButton = document.getElementById('unblockButton');
    const deleteButton = document.getElementById('deleteButton');

    if (logoutButton){
        logoutButton.addEventListener('click', function(event){
            sessionStorage.clear();
        });
    }
    
    if (blockButton){
        blockButton.addEventListener('click', function(event){
            blockUser();
        });
    }
    
    if (unblockButton){
        unblockButton.addEventListener('click', function(event){
            unblockUser();
        });
    }
    
    if (deleteButton){
        deleteButton.addEventListener('click', function(event){
            deleteUser();
        });
    }

    // Get a reference to the table body
    const tableBody = document.querySelector('.table.table-light tbody'); // Select the tbody directly
    // If the tbody doesn't exist, create it
    if (!tableBody) {
        const table = document.querySelector('.table.table-light');
        const newTbody = document.createElement('tbody');
        newTbody.id = 'userTableBody'; // Give it an ID for easier selection
        table.appendChild(newTbody);
    }

    // Get references to the checkboxes
    const checkAllCheckbox = document.getElementById('checkAll'); // The "select all" checkbox

    async function GetData() {
        try{
            const response = await fetch(`${apiURL}User/GetUsers`,{
                method:'GET'
            })
            
            const result = await response.json();
            
            if(!response.ok){
                showAlert(result.data,false);
                return null;
            }
            else{
                return result.data;
            }
        }
        catch(error){
            showAlert("Unable to access server");
            return null;
        }
    }

    async function GraphicateResults() {
        const users = await GetData(); 

        if (users && users.length > 0) {
            tableBody.innerHTML = ''; 

            users.forEach(user => {
                const row = document.createElement('tr');

                const checkboxCell = document.createElement('td');
                const checkboxInput = document.createElement('input');
                checkboxInput.className = 'form-check-input user-checkbox'; // Keep this class
                checkboxInput.type = 'checkbox';
                checkboxInput.value = user.idUser; 
                checkboxCell.appendChild(checkboxInput);
                row.appendChild(checkboxCell);

                const nameCell = document.createElement('td');
                nameCell.textContent = user.name;
                row.appendChild(nameCell);

                const emailCell = document.createElement('td');
                emailCell.textContent = user.email;
                row.appendChild(emailCell);

                const lastSeenCell = document.createElement('td');
                if (user.last_Connection) {
                    try {
                        const date = new Date(user.last_Connection);
                        lastSeenCell.textContent = date.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }); 
                    } catch (e) {
                        lastSeenCell.textContent = user.last_Connection; 
                    }
                } else {
                    lastSeenCell.textContent = 'N/A';
                }
                row.appendChild(lastSeenCell);

                if(user.blocked) {
                    row.classList.add('table-secondary')
                }

                tableBody.appendChild(row);
            });

            // After populating the table, add event listeners for individual checkboxes
            // and reset the "select all" checkbox state
            updateCheckAllState(); // Call this initially
            addIndividualCheckboxListeners(); // Add listeners for changes in individual checkboxes

        } else if (users === null) {
            tableBody.innerHTML = '<tr><td colspan="4">Failed to load users.</td></tr>';
        } else {
            tableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
        }
    }

    // Call to populate the table
    GraphicateResults(); 

    // --- New Checkbox Selection Logic ---

    // Event listener for the "Select All" checkbox
    checkAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked; // I will take the check state of the Select All checkbox
        const individualCheckboxes = document.querySelectorAll('.user-checkbox'); // Select all individual checkboxes

        individualCheckboxes.forEach(checkbox => { // All individual checkboxes will have the same state of the Select All checkbox
            checkbox.checked = isChecked;
        });
    });

    // Function to add event listeners to individual checkboxes
    // This needs to be called after the table rows are created
    function addIndividualCheckboxListeners() {
        const individualCheckboxes = document.querySelectorAll('.user-checkbox');
        individualCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateCheckAllState);
        });
    }

    // Function to update the state of the "Select All" checkbox
    // based on the state of individual checkboxes
    function updateCheckAllState() {
        const individualCheckboxes = document.querySelectorAll('.user-checkbox');
        const checkedCount = document.querySelectorAll('.user-checkbox:checked').length;
        const totalCount = individualCheckboxes.length;

        if (totalCount === 0) {
            checkAllCheckbox.checked = false;
            checkAllCheckbox.indeterminate = false; // No checkboxes, so not indeterminate
        } else if (checkedCount === totalCount) {
            checkAllCheckbox.checked = true;
            checkAllCheckbox.indeterminate = false; // All are checked
        } else if (checkedCount > 0) {
            checkAllCheckbox.checked = false; // Not all are checked
            checkAllCheckbox.indeterminate = true; // Some are checked, but not all
        } else {
            checkAllCheckbox.checked = false;
            checkAllCheckbox.indeterminate = false; // None are checked
        }
    }

    async function isCurrentUserBlocked() {
        const account = sessionStorage.getItem('email');
        data = {'email':account}
        try{
            const response = await fetch(`${apiURL}User/IsUserBlocked`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(!response.ok){
                showAlert(result.data,false);
                return null;
            }
            else{
                return result.data;
            }
        }
        catch(error){
            showAlert("Unable to access server");
            return null;
        }
    }

    async function blockUser(){
        if (await isCurrentUserBlocked()){
            logOutUser();
        }
        const checkedCheckboxes = document.querySelectorAll('.user-checkbox:checked')
        let UserIDs = [];
        checkedCheckboxes.forEach(checkbox => UserIDs.push(checkbox.value))

        if(UserIDs.length === 0){
            return showAlert("No users selected",false);
        }

        try{
            const response = await fetch(`${apiURL}User/BlockUser`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(UserIDs)
            });

            if(!response.ok){
                const failReason = await response.json();
                showAlert(failReason.data,false);
            }
            else{
                showAlert('User/s Blocked Successfully',true);
                await delay(3000);
                location.reload();
            }
        }
        
        catch(error){
            showAlert("Unable to access server",false); 
        }

    }
    
    async function unblockUser(){
        if (await isCurrentUserBlocked()){
            logOutUser();
        }
        const checkedCheckboxes = document.querySelectorAll('.user-checkbox:checked')
        let UserIDs = [];
        checkedCheckboxes.forEach(checkbox => UserIDs.push(checkbox.value))

        if(UserIDs.length === 0){
            return showAlert("No users selected",false);
        }

        try{
            const response = await fetch(`${apiURL}User/UnblockUser`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(UserIDs)
            });

            if(!response.ok){
                const failReason = await response.json();
                showAlert(failReason.data,false);
            }
            else{
                showAlert('User/s Unblocked Successfully',true);
                await delay(3000);
                location.reload();
            }
        }
        
        catch(error){
            showAlert("Unable to access server",false); 
        }
        
    }
    
    async function deleteUser(){
        if (await isCurrentUserBlocked()){
            logOutUser();
        }
        const checkedCheckboxes = document.querySelectorAll('.user-checkbox:checked')
        let UserIDs = [];
        checkedCheckboxes.forEach(checkbox => UserIDs.push(checkbox.value))

        if(UserIDs.length === 0){
            return showAlert("No users selected",false);
        }

        try{
            const response = await fetch(`${apiURL}User/DeleteUser`,{
                method:'DELETE',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(UserIDs)
            });

            if(!response.ok){
                const failReason = await response.json();
                showAlert(failReason.data,false);
            }
            else{
                showAlert('User/s Deleted Successfully',true);
                await delay(3000);
                location.reload();
            }
        }
        
        catch(error){
            showAlert("Unable to access server",false); 
        }
        
    }

    function logOutUser(){
        sessionStorage.clear();
        location.replace("./../index.html");
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