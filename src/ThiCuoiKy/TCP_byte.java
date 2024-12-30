package ThiCuoiKy;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

public class TCP_byte {
    public static int ucnn(int a, int b){
        while (b!=0){
            int tmp=b;
            b=a%b;
            b=tmp;
        }
        return a;
    }
    public static boolean snn(int n){
        if (n<=1) return false;
        for (int i=2;i<= Math.sqrt(n);i++){
            if (n%i==0) return false;
        }
        return true;
    }


    public static boolean ntcn(int a,int b) {
        return ucnn(a,b)==1;
    }

    public static void main(String[] args) throws IOException {
        Socket sc=new Socket("203.162.10.109",2206);
        InputStream in=sc.getInputStream();
        OutputStream out=sc.getOutputStream();
        String s="B21DCCN405;AKzlglf0";
        out.write(s.getBytes());
        System.out.println(s);

        byte[] received=new byte[1024];
        int bytesread=in.read(received);

        String receivedmessage=new String(received,0,bytesread);
        String[] nums=receivedmessage.split("\\|");
        int sum=0;
        for (String num:nums){
            sum+=Integer.parseInt(num);
        }
        System.out.println(sum);
        out.write((sum+"").getBytes());
        System.out.println(sum);
        in.close();
        out.close();
        sc.close();
    }
}
