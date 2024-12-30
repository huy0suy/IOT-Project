package ThiCuoiKy;

import java.io.IOException;
import java.net.*;
import java.sql.SQLOutput;

public class UDP_String{
    public static void main(String[] args) throws IOException {
        int port = 2208; // Cổng giao tiếp
        String serverIP = "203.162.10.109"; // Địa chỉ server
        InetAddress serverAddress = InetAddress.getByName(serverIP);

        DatagramSocket clientSocket = new DatagramSocket();

        // a. Gửi thông điệp ban đầu
        String studentCode = "B21DCCN438";
        String qCode = "T7NkinPW";
        String sendMessage = ";" + studentCode + ";" + qCode;

        byte[] sendData = sendMessage.getBytes();
        DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, serverAddress, port);
        clientSocket.send(sendPacket);
        System.out.println("Đã gửi: " + sendMessage);

        // b. Nhận thông điệp từ server
        byte[] receiveData = new byte[1024];
        DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
        clientSocket.receive(receivePacket);

        String response = new String(receivePacket.getData(), 0, receivePacket.getLength());
        System.out.println("Nhận từ server: " + response);

        // Tách requestId và strInput
        String[] parts = response.split(";");
        String requestId = parts[0];
        String strInput = parts[1];

        // c. Xử lý chuỗi thủ công
        String strOutput = filter(strInput);
        System.out.println("Chuỗi kết quả sau xử lý: " + strOutput);
        // Gửi kết quả lại server
        String resultMessage = requestId + ";" + strOutput;
        byte[] resultData = resultMessage.getBytes();
        DatagramPacket resultPacket = new DatagramPacket(resultData, resultData.length, serverAddress, port);
        clientSocket.send(resultPacket);
        System.out.println("Đã gửi kết quả: " + resultMessage);
        System.out.println();
        System.out.println("Đã gửi kết quả");
        System.out.println();

        // Đóng kết nối
        clientSocket.close();
    }

    // Hàm xử lý chuỗi thủ công: Loại bỏ số, ký tự đặc biệt và trùng lặp
    private static String filter(String input){
        String result="";
        for (int i=0;i<input.length();i++){
            char c=input.charAt(i);
            if (Character.isLetter(c) && result.indexOf(c)==-1){
                result+=c;
            }
        }
        return result;
    }
}
