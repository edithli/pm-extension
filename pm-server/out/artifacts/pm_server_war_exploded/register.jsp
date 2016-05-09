<%--
  Created by IntelliJ IDEA.
  User: lss
  Date: 2016/5/8
  Time: 18:07
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>register</title>
    <script src="script/register.js"></script>
</head>
<body>
    <form method="post" action="RegisterServlet" id="register-form" onsubmit="return checkForm()">
        <div>
            <label id="user-name-label">Username:</label>
            <input id="username-input" type="text" name="username"/>
        </div>
        <div>
            <label id="password-hint-label">Password Hint: </label>
            <input id="password-hint" type="text" name="password-hint"/>
        </div>
        <div>
            <input id="cipher-checksum" name="cipher-checksum" type="text" style="display: none;" />
        </div>
        <input type="submit" id="register-submit" value="Submit"/>
    </form>
    <div>
        <label id="password-label">Master Password: </label>
        <input id="password-input" type="password"/>
    </div>
    <div>
        <label id="checksum-label">Checksum: </label>
        <input id="checksum-input" type="text" />
    </div>
</body>
</html>
