package servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by lss on 2016/6/6.
 */
@WebServlet("/LogoutServlet")
public class LogoutServlet extends HttpServlet{
    public LogoutServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.getSession(false).removeAttribute("main_user");
        System.out.println("user logged out " + (req.getSession(false).getAttribute("main_user") == null));
    }
}
