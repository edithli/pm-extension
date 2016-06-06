<%@ page import="core.User" %>
<%@ page import="core.LoginEntry" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%--
  Created by IntelliJ IDEA.
  User: lss
  Date: 2016/5/9
  Time: 13:37
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    User user = (User)(session.getAttribute("main_user"));
    String username = "请登录";
    String cipherChecksum = "请登录";
    List<LoginEntry> list = new ArrayList<>();
    if (user == null){
        System.out.println("no user in user page");
//        user = new User("TEST", "TEST", "TEST");
        response.sendRedirect("login.html");
    } else {
        System.out.println("find user in session");
        username = user.username;
        cipherChecksum = user.cipherChecksum;
        list = user.getEntries();
    }
%>
<html>
<head>
    <meta charset="utf-8" />
    <title>主页</title>
    <style>
        html {
            height: 100%;
            width: 100%;
        }
        body {
            height: 100%;
            width: 100%;
            display: -webkit-flex;
            display:         flex;
            -webkit-align-items: center;
            align-items: center;
            -webkit-justify-content: center;
            justify-content: center;
        }
        #container {
            width: 60%;
            height: 100%;
            position: relative;
            background-color: antiquewhite;
            padding: 20px;
            border: 2px solid lightgray;
            border-bottom: 0;
            border-top: 0;
            min-width:200px;
            min-height: 300px;
            max-width: 550px;
        }
        #user-info div{
            font-size: 1em;
            text-align: center;
            width: 100%;
            padding-bottom: 10px;
        }
        button {
            background-color: white;
            border: 1px solid lightgray;
            border-radius: 5px;
            font-size: 1em;
            height: 25px;
            padding: 0;
            margin-top: 20px;
            width: 40%;
        }
        #show-password {
            float: left;
        }
        #hide-password {
            float: right;
        }
        table {
            width: 100%;
            margin-top: 10px;
            text-align: center;
        }
        table tr {
            border: 3px solid brown;
            height: 20px;
        }
        td, th{
            width: 30%;
        }
    </style>
</head>
    <div id="container">
        <div id="user-info">
            <div>WELCOME ABOARD</div>
            <p>Username: <span><%=username%></span></p>
            <p>Checksum: <span id="checksum"><%=cipherChecksum%></span></p>
            <button id="logout">退出</button>
        </div>
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
        <button id="show-password">显示密码</button>
        <button id="hide-password">隐藏密码</button>
    </div>
</body>
</html>
