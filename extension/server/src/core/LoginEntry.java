package core;

/**
 * Created by lss on 2016/5/9.
 */
public class LoginEntry {
    public String domain, nickname, ctpwd, acname;

    public LoginEntry(String domain, String acname, String nickname, String ctpwd){
        this.domain = domain;
        this.acname = acname;
        this.nickname = nickname;
        this.ctpwd = ctpwd;
    }
}
