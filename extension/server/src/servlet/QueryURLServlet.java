package servlet;

import core.DatabaseOperator;
import core.LoginEntry;
import core.User;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

/**
 * Created by lss on 2016/5/9.
 */
@WebServlet("/QueryURLServlet")
public class QueryURLServlet extends HttpServlet {
    public QueryURLServlet(){
        super();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        BufferedReader br = req.getReader();
        StringBuffer sb = new StringBuffer();
        String line;
        while((line = br.readLine()) != null){
            sb.append(line);
        }
        JSONObject j = new JSONObject(sb.toString());
//        System.out.println("query url req: " + sb.toString());
        String username = j.getString("username");
        String domain = j.getString("domain");
        JSONObject result = new JSONObject();
        if (DatabaseOperator.getInstance().queryUser(username) == null){
            result.append("noUser", true);
        } else {
            User user = new User(username, null, null);
            LoginEntry e = user.queryByDomain(domain);
            if (e == null) {
                result.append("noEntry", true);
            } else {
                result.append("hasEntry", true);
                result.append("nickname", e.nickname);
                result.append("password", e.ctpwd);
            }
        }
//        System.out.println("query url result: " + result.toString());
        resp.getWriter().println(result.toString());
    }
}
