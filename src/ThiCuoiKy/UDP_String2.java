package ThiCuoiKy;

import java.io.IOException;
import java.net.*;

public class UDP_String2 {
    public static String filter(String input){
        String result="";

        for (int i=0;i<input.length();i++){
            char c=input.charAt(i);
            if (Character.isLetter(c) && result.indexOf(c)==-1){
                result+=c;
            }
        }
        return result;

    }

    public static void main(String[] args) throws IOException {
        int port=2208;
        String IP="203.162.10.109";
        InetAddress sever=InetAddress.getByName(IP);
        DatagramSocket Client=new DatagramSocket();

        // Gửi thông msv + mã câu hỏi
        String studentCode="B21DCCN438";
        String qCode="T7NkinPW";
        String message1=";" +studentCode+";"+qCode;
        byte[] send1=message1.getBytes();
        DatagramPacket sendmessage=new DatagramPacket(send1, send1.length,sever,port);
        Client.send(sendmessage);
        
        //Nhận tin
        byte[] received=new byte[1024];
        DatagramPacket receivedmessage=new DatagramPacket(received, received.length,sever,port);
        Client.receive(receivedmessage);
        String respone=new String(receivedmessage.getData(),0, receivedmessage.getLength());
        String part[]=respone.split(";");
        String requestID=part[0];
        String content=part[1];
        String resultmessage=filter(content);
        String resultMessage = requestID + ";" + resultmessage;
        byte[] send2 = resultMessage.getBytes();
        DatagramPacket sendPacket=new DatagramPacket(send2, send2.length,sever,port);
        Client.send(sendPacket);
        Client.close();
    }

}
