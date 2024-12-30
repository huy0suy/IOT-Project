package TH1;


import java.io.IOException;
import java.lang.reflect.Array;
import java.net.*;
import java.util.Arrays;

public class TH1 {


    public static void main(String[] args) throws IOException {
        int port=2207;
        String IP="203.162.10.109";
        DatagramSocket Client=new DatagramSocket();
        String messages=";" +"B21DCCN438"+";" + "bKRv5w4T";
        byte[] send=messages.getBytes();
        InetAddress sever=InetAddress.getByName(IP);
        DatagramPacket sendd=new DatagramPacket(send,send.length,sever,port);
        Client.send(sendd);
        System.out.println("Đã gửi: " + messages);

        byte[] receive= new byte[1024];
        DatagramPacket receivePackage= new DatagramPacket(receive,receive.length,sever,port);
        Client.receive(receivePackage);
        String receivemessage= new String(receivePackage.getData(),0,receivePackage.getLength());

        String[] parts=receivemessage.split(";");
        String requestId = parts[0];
        String data = parts[1];
        String[] part2=parts[1].split(",");
        int[] z= Arrays.stream(part2).mapToInt(Integer::parseInt).toArray();
        Arrays.sort(z);
        int secondMax = z[z.length - 2];
        int secondMin = z[1];
        String resultMessage = requestId + ";" + secondMax + "," + secondMin;
        DatagramPacket send2=new DatagramPacket(resultMessage.getBytes(),resultMessage.length(),sever,port);
        Client.send(send2);
        Client.close();


    }
}
