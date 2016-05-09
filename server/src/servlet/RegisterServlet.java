package servlet;

import core.StorageAction;
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
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        if (StorageAction.queryUser(req.getParameter("username")) != null){
            out.write("REGISTERED");
        } else out.write("UNREGISTERED");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        User user = new User(req.getParameter("username"), req.getParameter("password-hint"));
        StorageAction.addUser(user);
        req.getSession().setAttribute("user", user);
        resp.sendRedirect("index.jsp");
    }
}
