package servlet;

import core.DatabaseOperator;
import core.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by lss on 2016/5/8.
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet{
    public LoginServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String username = req.getParameter("username");
        System.out.println("login: " + username);
        User user = DatabaseOperator.getInstance().queryUser(username);
        // login page should use ajax to check username
        PrintWriter out = resp.getWriter();
        if (user != null){
            req.getSession().setAttribute("user", user);
            System.out.println("output checksum: " + user.cipherChecksum);
            out.println(user.cipherChecksum);
        }else{
            System.out.println("user not found");
            out.println("invalid");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

    }
}
