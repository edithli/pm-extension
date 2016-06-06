package servlet;

import core.User;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by lss on 2016/5/9.
 */
@WebServlet("/AddAccountServlet")
public class AddAccountServlet extends HttpServlet{
    public AddAccountServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        super.doGet(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = (User)req.getSession().getAttribute("main_user");
        PrintWriter out = resp.getWriter();
        if (user == null){
            System.out.println("No USER!!!!");
            out.println("NO USER IN SESSION");
        }else {
            BufferedReader br = req.getReader();
            StringBuffer sb = new StringBuffer();
            String line;
            while ((line = br.readLine()) != null)
                sb.append(line);
            System.out.println("AUS json str: " + sb.toString());
            JSONObject j = new JSONObject(sb.toString());
            String username = j.getString("username");
            if (!user.username.equals(username)){
                out.println("username not matched!");
            }else if (user.addEntry(j.getString("domain"), j.getString("ac_name"),
                    j.getString("nickname"), j.getString("ctpwd")))
                out.println("done");
            else out.println("add user failed");
            br.close();
        }
    }
}
