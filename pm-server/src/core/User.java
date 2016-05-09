package core;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by lss on 2016/5/8.
 */
public class User {
    public String username;
    public String passwordHint;
    public String cipherChecksum;

    private List<LoginEntry> entries;

    public User(String username, String passwordHint, String cipherChecksum){
        this.username = username;
        this.passwordHint = passwordHint;
        this.cipherChecksum = cipherChecksum;
        this.entries = new ArrayList<>();
    }

    public String tableName(){
        return "table_" + username;
    }

    public String toString(){
        return "User " + username + " " + passwordHint + " " + cipherChecksum;
    }

    public List<LoginEntry> getEntries(){
        DatabaseOperator db = DatabaseOperator.getInstance();
        return db.queryUserAll(this);
    }

    public boolean addEntry(String domain, String acname, String nickname, String pwd){
        DatabaseOperator db = DatabaseOperator.getInstance();
        System.out.println("To add into user " + this.toString());
        System.out.println(domain + " " + acname + " " + nickname + " " + pwd);
        return db.insertIntoUser(this, new LoginEntry(domain, acname, nickname, pwd));
    }

    public LoginEntry queryByDomain(String domain){
        DatabaseOperator db = DatabaseOperator.getInstance();
        return db.queryInUser(this, domain);
    }
}
