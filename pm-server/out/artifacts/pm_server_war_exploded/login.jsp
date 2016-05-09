<%--
  Created by IntelliJ IDEA.
  User: lss
  Date: 2016/5/8
  Time: 22:08
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Welcome Login</title>
</head>
<body>
    <form method="post" action="/LoginServlet">
        <div>
            <label id="user-name-label">Username: </label>
            <input type="text" name="username" />
        </div>
    </form>
    <div>
        <label id="pwd-label">Password: </label>
        <input type="password" id="master-password" />
    </div>
    <button id="login-btn" type="submit">Login</button>
    <button id="cancel">Cancel</button>
    <a href="register.jsp" id="register-link">Register</a>
    <div id="cipher-checksum"></div>
</body>
</html>
