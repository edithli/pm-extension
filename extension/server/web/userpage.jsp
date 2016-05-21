<%@ page import="core.User" %>
<%@ page import="core.LoginEntry" %>
<%@ page import="java.util.List" %>
<%--
  Created by IntelliJ IDEA.
  User: lss
  Date: 2016/5/9
  Time: 13:37
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    User user = (User)request.getSession().getAttribute("user");
    if (user == null){
        response.sendRedirect("/login.html");
    }
    String username = user.username;
    String cipherChecksum = user.cipherChecksum;
    List<LoginEntry> list = user.getEntries();
%>
<html>
<head>
    <title>HOMEPAGE</title>
</head>
<body>
    <div>
        <p>Username: <span><%=username%></span></p>
        <p>Checksum: <span id="checksum">TEST</span></p>
    </div>
    <button id="show-password">SHOW PASSWORD</button>
    <button id="hide-password">HIDE PASSWORD</button>
    <table>
        <tr>
            <th>域名</th>
            <th>用户名</th>
            <th>密码</th>
        </tr>
        <%for(LoginEntry e: list){%>
        <tr>
            <td class="domain"><%=e.domain%></td>
            <td class="nickname"><%=e.nickname%></td>
            <td class="password"><%=e.ctpwd%></td>
        </tr>
        <%}%>
    </table>
    <button id="manual_add">添加</button>
</body>
</html>
