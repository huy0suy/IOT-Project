package TH1;



import java.io.IOException;
import java.net.*;

public class TH3 {
    public static void main(String[] args) throws IOException {
        int port = 2208;
        String IP = "203.162.10.109";  // Đổi IP server nếu cần
        InetAddress server = InetAddress.getByName(IP);
        DatagramSocket client = new DatagramSocket();

        // a. Gửi thông điệp mã sinh viên và mã câu hỏi
        String studentCode = "B21DCCN438";
        String qCode = "2Ru97tHs";
        String message = ";" + studentCode + ";" + qCode;
        byte[] sendData = message.getBytes();
        DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, server, port);
        client.send(sendPacket);
        System.out.println("Đã gửi: " + message);

        // b. Nhận thông điệp từ server
        byte[] receiveData = new byte[1024];
        DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
        client.receive(receivePacket);
        String response = new String(receivePacket.getData(), 0, receivePacket.getLength());
        System.out.println("Nhận từ server: " + response);

        // Phân tích thông điệp
        String[] parts = response.split(";", 2);
        String requestId = parts[0];
        String data = parts[1];

        // c. Xử lý chuẩn hóa chuỗi: Ký tự đầu in hoa, các ký tự sau in thường
        String[] words = data.split("\\s+");
        StringBuilder formattedData = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                formattedData.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase()).append(" ");
            }
        }
        String resultData = formattedData.toString().trim();

        // Gửi lại thông điệp đã chuẩn hóa
        String resultMessage = requestId + ";" + resultData;
        byte[] resultBytes = resultMessage.getBytes();
        DatagramPacket resultPacket = new DatagramPacket(resultBytes, resultBytes.length, server, port);
        client.send(resultPacket);
        System.out.println("Đã gửi kết quả: " + resultMessage);

        // d. Đóng socket
        client.close();
    }
}
