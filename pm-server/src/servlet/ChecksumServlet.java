package servlet;

import core.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by lss on 2016/5/9.
 */
@WebServlet("/ChecksumServlet")
public class ChecksumServlet extends HttpServlet {
    public ChecksumServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = (User)req.getSession().getAttribute("user");
        PrintWriter out = resp.getWriter();
        if (user == null){
            out.println("no_user");
        }else {
            out.println(user.cipherChecksum);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        super.doPost(req, resp);
    }
}
