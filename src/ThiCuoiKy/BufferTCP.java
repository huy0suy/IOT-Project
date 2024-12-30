package ThiCuoiKy;

import java.io.*;
import java.net.Socket;

public class BufferTCP {
    public static void main(String[] args) throws IOException {
        Socket sc=new Socket("203.162.10.109",2208);
        BufferedReader in=new BufferedReader(new InputStreamReader(sc.getInputStream()));
        BufferedWriter out=new BufferedWriter(new OutputStreamWriter(sc.getOutputStream()));
        out.write("B21DCCN405;TADvSufA");
        out.newLine();
        out.flush();

        String s= in.readLine();
        String kytu="";
        String dacbiet="";
        for (int i=0;i<s.length();i++){
            char c=s.charAt(i);
            if (Character.isLetterOrDigit(c)){
                kytu+=c;
            }else {
                dacbiet+=c;
            }
        }
        System.out.println(dacbiet+ "Một ngày nào đó em sẽ nhận ra những lời anh nói");
        out.write(kytu);
        out.newLine();
        out.flush();
        out.write(dacbiet);
        out.newLine();
        out.flush();
        System.out.println(kytu);

        System.out.println(dacbiet);
        sc.close();
        out.close();
        in.close();
    }

}
