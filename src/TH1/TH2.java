package TH1;

import java.io.IOException;
import java.net.*;
import java.util.Arrays;

public class TH2 {
    public static void main(String[] args) throws IOException {
        // Khai báo cổng và địa chỉ IP server
        int port = 2207;
        String IP = "203.162.10.109";
        InetAddress server = InetAddress.getByName(IP);

        // Tạo socket UDP client
        DatagramSocket client = new DatagramSocket();

        // Bước a: Gửi thông điệp "mã sinh viên" và "mã câu hỏi"
        String studentCode = "B21DCCN438";
        String qCode = "SJorT0mH";
        String messageToSend = ";" + studentCode + ";" + qCode;
        byte[] sendData = messageToSend.getBytes();
        DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, server, port);
        client.send(sendPacket);
        System.out.println("Đã gửi: " + messageToSend);

        // Bước b: Nhận thông điệp từ server
        byte[] receiveBuffer = new byte[1024];
        DatagramPacket receivePacket = new DatagramPacket(receiveBuffer, receiveBuffer.length);
        client.receive(receivePacket);
        String receivedMessage = new String(receivePacket.getData(), 0, receivePacket.getLength());
        System.out.println("Nhận: " + receivedMessage);

        // Phân tách thông điệp thành requestId và dãy số
        String[] parts = receivedMessage.split(";");
        String requestId = parts[0];  // requestId
        String numbersData = parts[1];  // Dãy số nguyên
        String[] numberStrings = numbersData.split(",");

        // Chuyển dãy số thành mảng số nguyên và sắp xếp
        int[] numbers = Arrays.stream(numberStrings).mapToInt(Integer::parseInt).toArray();
        Arrays.sort(numbers);

        // Bước c: Tìm giá trị lớn nhất và nhỏ nhất
        int max = numbers[numbers.length - 1];
        int min = numbers[0];

        // Tạo thông điệp kết quả theo định dạng "requestId;max,min"
        String resultMessage = requestId + ";" + max + "," + min;
        byte[] resultData = resultMessage.getBytes();
        DatagramPacket resultPacket = new DatagramPacket(resultData, resultData.length, server, port);
        client.send(resultPacket);
        System.out.println("Đã gửi kết quả: " + resultMessage);

        // Bước d: Đóng socket
        client.close();
    }
}
