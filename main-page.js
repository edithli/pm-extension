function manualAddAccount() {
	var newDomain = document.getElementById("new_domain").value;
	var newUsername = document.getElementById("new_username").value;
	var newPassword = document.getElementById("new_password").value;
	var table = document.getElementById("password_table");
	var newRow = table.insertRow();
	var newCell1 = newRow.insertCell();
	var newCell2 = newRow.insertCell();
	var newCell3 = newRow.insertCell();
	newCell1.innerHTML = newDomain;
	newCell2.innerHTML = newUsername;
	newCell3.innerHTML = newPassword;
	document.getElementById("new_domain").value = "";
	document.getElementById("new_username").value = "";
	document.getElementById("new_password").value = "";
}

document.addEventListener('DOMContentLoaded', function(){
	var addButton = document.getElementById('manualAddAccount');
	console.assert(addButton, "cannot find the account add button");
	addButton.onclick = function(){
		console.log('add button clicked');
		manualAddAccount();
	};
});