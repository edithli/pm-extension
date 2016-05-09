/**
 * Created by lss on 2016/5/9.
 */

function checkUsername(){
    var usernameInput = document.getElementById("username-input");
    var cks = document.getElementById("cipher-checksum");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            if (xmlhttp.responseText == "invalid"){
                usernameInput.style.border = "red";
                usernameInput.value = "invalid username";
                console.log("response invalid");
                return false;
            }else{
                usernameInput.style.border = "green";
                cks.focus();
                cks.value = xmlhttp.responseText;
                cks.blur();
                console.log("checksum: " + cks.value);
                return true;
            }
        }
    }
    xmlhttp.open("GET", "/pm-server/LoginServlet?username=" + usernameInput.value);
    xmlhttp.send();
}
