package core;

import sun.rmi.runtime.Log;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by lss on 2016/5/9.
 */
public class DatabaseOperator {
    private Connection connection;
    private static final String DB_URL = "jdbc:mysql://localhost:3306/pm-extension";
    private static final String DRIVER_CLASS = "com.mysql.jdbc.Driver";
    private static final String DB_USERNAME = "root";
    private static final String DB_PASSWORD = "123456";

    public static void main(String[] args){
        // test connection
        DatabaseOperator db = new DatabaseOperator();
        db.getConnection();
//        System.out.println(db.insertUser(new User("test", "test", "test")));
        System.out.println(db.queryUser("test") == null);
        db.closeConnection();
    }

    private static DatabaseOperator db = null;

    public static DatabaseOperator getInstance(){
        if (db == null)
            db = new DatabaseOperator();
        return db;
    }

    private DatabaseOperator() {
        getConnection();
    }

    public void getConnection(){
        try {
            Class.forName(DRIVER_CLASS);
            connection = DriverManager.getConnection(DB_URL, DB_USERNAME, DB_PASSWORD);
            System.out.println("pm-extension db connected");
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public boolean insertUser(User user){
        String str = "insert into `user_info` values (?, ?, ?);";
        try {
            int index = 1;
            PreparedStatement pst = connection.prepareStatement(str);
            pst.setString(index++, user.username);
            pst.setString(index++, user.passwordHint);
            pst.setString(index, user.cipherChecksum);
            if (pst.executeUpdate() <= 0) {
                System.out.println("insert table of " + user.username + " failed!");
                pst.close();
                return false;
            }
            // insert user table
            str = "CREATE TABLE `pm-extension`.`" + user.tableName() + "` (\n" +
                    "  `domain` VARCHAR(255) NOT NULL,\n" +
                    "  `ac_name` VARCHAR(255) NULL,\n" +
                    "  `nickname` VARCHAR(255) NOT NULL,\n" +
                    "  `ctpwd` VARCHAR(255) NOT NULL,\n" +
                    "  PRIMARY KEY (`domain`),\n" +
                    "  UNIQUE INDEX `domain_UNIQUE` (`domain` ASC))\n" +
                    "ENGINE = InnoDB\n" +
                    "DEFAULT CHARACTER SET = utf8;";
            pst = connection.prepareStatement(str);
            if (pst.executeUpdate() >= 0) {
                pst.close();
                return true;
            }else {
                System.out.println("create table failed!");
                pst.close();
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public User queryUser(String username){
        User user = null;
        String str = "select * from `user_info` where username = ?";
        try {
            PreparedStatement pst = connection.prepareStatement(str);
            pst.setString(1, username);
            ResultSet rs = pst.executeQuery();
            if (rs.next()){
                user = new User(rs.getString("username"), rs.getString("pwdHint"), rs.getString("cipherChecksum"));
            }
            pst.close();
            rs.close();
            return user;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return user;
    }

    public void closeConnection(){
        try {
            connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public LoginEntry queryInUser(User user, String domain){
        String sql = "select * from ? where domain = ?";
        try {
            PreparedStatement pst = connection.prepareStatement(sql);
            pst.setString(1, user.tableName());
            pst.setString(2, "`" + domain + "`");
            ResultSet rs = pst.executeQuery();
            if (rs.next()){
                LoginEntry result = new LoginEntry(rs.getString("domain"), rs.getString("ac_name"),
                        rs.getString("nickname"), rs.getString("ctpwd"));
                rs.close();
                pst.close();
                return result;
            }else {
                System.out.println("query in user return null!");
            }
            rs.close();
            pst.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean insertIntoUser(User user, LoginEntry e){
        String sql = "insert into " + user.tableName() + " (domain, ac_name, nickname, ctpwd) values ('" +
                e.domain + "', '" + e.acname + "', '" + e.nickname + "', '" + e.ctpwd + "');";
        System.out.println(sql);
//        String sql = "insert into ? (domain, ac_name, nickname, ctpwd) values (?, ?, ?, ?);";
        try {
            PreparedStatement pst = connection.prepareStatement(sql);
//            int index = 1;
//            pst.setString(index++, user.tableName());
//            pst.setString(index++, e.domain);
//            pst.setString(index++, e.acname);
//            pst.setString(index++, e.nickname);
//            pst.setString(index, e.ctpwd);
            if (pst.executeUpdate() >= 0){
                pst.close();
                return true;
            }
            pst.close();
        } catch (SQLException e1) {
            e1.printStackTrace();
        }
        return false;
    }

    public List<LoginEntry> queryUserAll(User user){
        String sql = "select * from " + user.tableName();
        List<LoginEntry> list = new ArrayList<>();
        try {
            PreparedStatement pst = connection.prepareStatement(sql);
            ResultSet rs = pst.executeQuery();
            while (rs.next()){
                list.add(new LoginEntry(rs.getString("domain"), rs.getString("ac_name"),
                        rs.getString("nickname"), rs.getString("ctpwd")));
            }
            rs.close();
            pst.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

}
