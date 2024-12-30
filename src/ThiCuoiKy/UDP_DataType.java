package ThiCuoiKy;

import javax.xml.crypto.Data;
import java.io.IOException;
import java.lang.reflect.Array;
import java.net.*;
import java.util.Arrays;

public class UDP_DataType {
    public static boolean isPrime(int number){
        if (number<1) return false;
        for (int i=2;i<=Math.sqrt(number);i++){
            if (number%i==0){
                return false;
            }
        }
        return true;
    }
    public static int gcd(int a, int b){
        while (b!=0){
            int c=b;
            b=a%b;
            a=c;
        }
        return a;
    }
    public static boolean ntcn(int a, int b){
        return gcd(a,b)==1;
    }
    public static void main(String[] args) throws IOException {
        int port=2207;
        String IP="203.162.10.109";
        InetAddress sever=InetAddress.getByName(IP);
        DatagramSocket Client=new DatagramSocket();
//send message

        String studentCode = "B21DCCN438";
        String qCode = "SJorT0mH ";
        String message = ";" + studentCode + ";" + qCode;
        byte[] senddata=message.getBytes();
        DatagramPacket send1=new DatagramPacket(senddata, senddata.length, sever,port );
        Client.send(send1);
        System.out.println("Đã gửi: " + message);
        System.out.println("Đã gửi" +message);
        System.out.println("Đã gửi");
// received message
        byte[] receicedata=new byte[1024];
        DatagramPacket receivePacket= new DatagramPacket(receicedata, receicedata.length);
        Client.receive(receivePacket);
        String respone=new String(receivePacket.getData(),0, receivePacket.getLength());
        StringBuilder strinput =new StringBuilder();
        String parts[]=respone.split(";");
        String requestID=parts[0];
        String ArrayLisst=parts[1];
        
        String[] ArrayLisst2=ArrayLisst.split(",");
        int[] number= Arrays.stream(ArrayLisst2).mapToInt(Integer::parseInt).toArray();
        Arrays.sort(number);
        int max=number[number.length-1];
        int min=number[0];
        String resultMessage = requestID+ ";" + max + "," + min;
        byte[] send2=resultMessage.getBytes();
        DatagramPacket resultPacket=new DatagramPacket(send2, send2.length, sever,port);
        Client.send(resultPacket);

        System.out.println("Đã gửi kết quả: " + resultMessage);
        Client.close();

    }
}
