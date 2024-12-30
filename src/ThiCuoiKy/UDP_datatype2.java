package ThiCuoiKy;

import java.io.IOException;
import java.net.*;
import java.util.Arrays;
import java.util.Collections;

public class UDP_datatype2 {
    public static int ucln(int a, int b){
        while(b!=0){
            int tmp=b;
            b=a%b;
            a=tmp;
        }
        return a;
    }
    public static void main(String[] args) throws IOException {
        int port=2207;
        String IP="203.162.10.109";
        InetAddress sever=InetAddress.getByName(IP);
        DatagramSocket Client=new DatagramSocket();
        // Gửi thông msv + mã câu hỏi
        String studentCode="B21DCCN438";
        String qCode="SJorT0mH";
        String message1=";" +studentCode+";"+qCode;
        byte[] send1=message1.getBytes();
        DatagramPacket sendmessage=new DatagramPacket(send1, send1.length,sever,port);
        Client.send(sendmessage);
        System.out.println(message1);
        // Nhan tin
        byte[] received=new byte[1024];
        DatagramPacket receivedmessage=new DatagramPacket(received, received.length,sever,port);
        Client.receive(receivedmessage);
        String respone=new String(receivedmessage.getData(),0, receivedmessage.getLength());
        String[] part=respone.split(";");
        String requestID=part[0];
        String content=part[1];
        String[] number=content.split(",");
        int[] numbers= Arrays.stream(number).mapToInt(Integer::parseInt).toArray();
        Arrays.sort(numbers);
        String sendmessage2=requestID+";"+numbers[numbers.length-1]+","+numbers[0];
        byte[] send2=sendmessage2.getBytes();
        DatagramPacket sendPacket=new DatagramPacket(send2,send2.length,sever,port);
        Client.send(sendPacket);
        System.out.println(sendmessage2);
        Client.close();
    }
}
