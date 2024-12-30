package ThiCuoiKy;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;

public class TCP_datastream {
    public static void main(String[] args) throws IOException {
        // Kết nối tới server
        Socket sc = new Socket("203.162.10.109", 2207);
        DataOutputStream out = new DataOutputStream(sc.getOutputStream());
        DataInputStream in = new DataInputStream(sc.getInputStream());

        // Bước a: Gửi chuỗi "B21DCCN405;olX3lcJm" tới server
        out.writeUTF("B21DCCN405;olX3lcJm");
        out.flush();

        // Bước b: Nhận từ server số lượng phần tử mảng
        int n = in.readInt();
        int[] a = new int[n];

        // Nhận mảng các số nguyên từ server
        for (int i = 0; i < n; i++) {
            a[i] = in.readInt();
        }

        // Tính tổng mảng
        int sum = 0;
        for (int num : a) {
            sum += num;
        }

        // Tính trung bình cộng
        float average = (float) sum / n;

        // Tính phương sai
        float variance = 0;
        for (int num : a) {
            variance += Math.pow(num - average, 2);
        }
        variance /= n;

        // Bước c: Gửi kết quả lên server (tổng, trung bình cộng, phương sai)
        out.writeInt(sum); // Gửi tổng
        out.writeFloat(average); // Gửi trung bình cộng
        out.writeFloat(variance); // Gửi phương sai

        // Đóng kết nối
        out.close();
        in.close();
        sc.close();
    }
}
