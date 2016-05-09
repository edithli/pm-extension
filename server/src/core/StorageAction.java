package core;

import java.io.*;

/**
 * Created by lss on 2016/5/8.
 */
public class StorageAction {
    private final static String USER_INFO_PATH = "storage/user_info.txt";

    public static void addUser(User user){
        File file = new File(USER_INFO_PATH);
        try {
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, true)));
            bw.write(user.username + "\t" + user.passwordHint + "\n");
            bw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static User queryUser(String username){
        File file = new File(USER_INFO_PATH);
        User user = null;
        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
            String line;
            while ((line = br.readLine()) != null){
                String[] tmp = line.split("\t");
                if (tmp[0].equals(username)) {
                    user = new User(tmp[0], tmp[1]);
                    break;
                }
            }
            br.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return user;
    }
}
