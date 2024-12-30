package ThiCuoiKy;

import jdk.jfr.DataAmount;

import java.io.IOException;
import java.net.*;
import java.util.Arrays;

public class UDP_datatype3 {
    public static void main(String[] args) throws IOException {
        int port=2208;
        String IP="203.162.10.109";
        InetAddress sever=InetAddress.getByName(IP);
        DatagramSocket Client=new DatagramSocket();
        String sendmessage=";B21DCCN405;v0earHfh";
        byte[] mesage=sendmessage.getBytes();
        DatagramPacket send1=new DatagramPacket(mesage, mesage.length,sever,port);
        Client.send(send1);

        byte[] receiced=new byte[1024];
        DatagramPacket receicedmessage=new DatagramPacket(receiced, receiced.length);
        Client.receive(receicedmessage);
        String respone=new String(receicedmessage.getData(),0,receicedmessage.getLength());
        String[] part=respone.split(";");
        String requestID=part[0];
        String content=part[1];
        String result="";
        for (int i=0;i<content.length();i++){
            char c=content.charAt(i);
            if (Character.isLetter(c)&& result.indexOf(c)==-1){
                result+=c;
            }
        }
        String send4=requestID+";"+result;
        byte[] sendmessage2=send4.getBytes();
        DatagramPacket sendPackage=new DatagramPacket(sendmessage2,sendmessage2.length,sever,port);
        Client.send(sendPackage);
        System.out.println(send4);
        Client.close();


    }
}
