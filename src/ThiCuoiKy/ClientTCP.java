package TCP;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

public class ClientTCP {
    public static void main(String[] args) throws IOException {
        // Tạo kết nối tới server tại cổng 2207
        Socket client = new Socket("203.162.10.109", 2207);

        // Gửi thông điệp chứa mã sinh viên và mã câu hỏi
        DataOutputStream dos = new DataOutputStream(client.getOutputStream());
        String studentCode = "B21DCCN438";
        String qCode = "VWvEZJkn";
        String message = studentCode + ";" + qCode;
        dos.writeUTF(message);  // Gửi chuỗi mã sinh viên và mã câu hỏi

        // Nhận số lần tung xúc xắc từ server
        DataInputStream dis = new DataInputStream(client.getInputStream());
        int n = dis.readInt();  // Đọc số lần tung xúc xắc
        System.out.println("Số lần tung xúc xắc: " + n);

        // Nhận các giá trị tung xúc xắc
        List<Integer> diceRolls = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            diceRolls.add(dis.readInt());  // Đọc từng giá trị tung xúc xắc
        }

        // Tính xác suất xuất hiện của các giá trị từ 1 đến 6
        float[] probabilities = calculateProbabilities(diceRolls);

        // Gửi các xác suất xuất hiện lên server
        for (float probability : probabilities) {
            dos.writeFloat(probability);  // Gửi xác suất dạng float
        }

        // Đóng các stream và kết nối
        dos.close();
        dis.close();
        client.close();
    }

    // Hàm tính xác suất xuất hiện của các giá trị 1, 2, 3, 4, 5, 6
    public static float[] calculateProbabilities(List<Integer> diceRolls) {
        int[] counts = new int[6];  // Mảng đếm số lần xuất hiện của từng giá trị
        for (int roll : diceRolls) {
            if (roll >= 1 && roll <= 6) {
                counts[roll - 1]++;
            }
        }

        float[] probabilities = new float[6];
        for (int i = 0; i < 6; i++) {
            probabilities[i] = (float) counts[i] / diceRolls.size();
        }
        return probabilities;
    }
}
