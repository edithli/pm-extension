package servlet;

import core.DatabaseOperator;
import core.User;

import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by lss on 2016/5/8.
 */
@WebServlet("/RegisterServlet")
public class RegisterServlet  extends HttpServlet{
    public RegisterServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//        super.doGet(req, resp);
        // check whether username is registered
        super.doGet(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//        String output = "";
//        output += "<html><body>";
//        output += "register enter do post";
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        User user = new User(req.getParameter("username"),
                req.getParameter("password-hint"), req.getParameter("cipher-checksum"));
        PrintWriter out = resp.getWriter();
        System.out.println("register user " + user.toString());
//        output += "register user " + user.toString();
        DatabaseOperator db = DatabaseOperator.getInstance();
        System.out.println("insert user success: " + db.insertUser(user));
//        output += "insert user success: " + db.insertUser(user);
        req.getSession().setAttribute("main_user", user);
//        output += "</body></html>";
//        out.println(output);
        resp.sendRedirect("userpage.jsp");
    }
}
