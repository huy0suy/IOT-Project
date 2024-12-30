import paho.mqtt.client as mqtt
from pymongo import MongoClient
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

# Kết nối đến MongoDB
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['iot_system']
sensor_collection = db['sensor_data']
device_control_history_collection = db['device_control_history']

# Cấu hình ứng dụng Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "DELETE", "OPTIONS"]}})

# Thông tin MQTT Broker
mqtt_broker = "172.20.10.6"
mqtt_port = 1993
mqtt_user = "huy"
mqtt_password = "0123456789"
mqtt_topic_data = "datasensors"
mqtt_topic_control = "controllight" 

# Cấu hình MQTT client
client = mqtt.Client()

# Xử lý kết nối MQTT
def on_connect(client, userdata, flags, rc):
    print(f"Kết nối đến MQTT broker với mã {rc}")
    client.subscribe(mqtt_topic_data)

# Xử lý tin nhắn MQTT
def on_message(client, userdata, message):
    try:
        msg = message.payload.decode()
        print(f"Nhận tin nhắn: {msg}")
        data_parts = msg.split(',')

        # Đảm bảo có đủ 4 phần tử: nhiệt độ, độ ẩm, ánh sáng, nhiệt độ ngoài trời
        if len(data_parts) < 4:
            print("Lỗi: Tin nhắn không đúng định dạng.")
            return  # Bỏ qua xử lý nếu không đúng định dạng

        # Loại bỏ các ký tự không mong muốn trước khi chuyển đổi
        temperature = float(data_parts[0].split(':')[1].strip().replace(' C', ''))
        humidity = float(data_parts[1].split(':')[1].strip().replace(' %', ''))
        light = float(data_parts[2].split(':')[1].strip().replace(' lux', ''))
        outdoor_temperature = float(data_parts[3].split(':')[1].strip().replace(' C', ''))

        # Xác định tên thiết bị từ tin nhắn
        device_name = "Thiết bị không xác định"
        if 'led1' in msg:
            device_name = "Đèn LED"
        elif 'led2' in msg:
            device_name = "Quạt"
        elif 'led3' in msg:
            device_name = "Máy lạnh"
        elif 'led4' in msg:
            device_name = "Đèn bếp"
        elif 'led5' in msg:
            device_name = "Đèn tủ"

        # Lưu dữ liệu cảm biến vào MongoDB 
        sensor_data = {
            'temperature': temperature,
            'humidity': humidity,
            'light': light,
            'outdoor_temperature': outdoor_temperature,
            'timestamp': datetime.utcnow() 
        }
        sensor_collection.insert_one(sensor_data)
        print("Dữ liệu cảm biến đã được lưu vào MongoDB")

    except Exception as e:
        print(f"Lỗi trong quá trình xử lý tin nhắn: {e}")

# Định dạng timestamp
def format_timestamp(timestamp):
    # Đảm bảo rằng timestamp là chuỗi theo định dạng này
    return timestamp.strftime("%Y-%m-%d %H:%M:%S")

# API điều khiển đèn LED
@app.route('/control_light', methods=['POST'])
def control_light():
    data = request.json
    command = data.get('command')

    # Ánh xạ lệnh đến tên thiết bị
    device_name = ""
    if command == "Led1_on" or command == "Led1_off":
        device_name = "Đèn LED"
    elif command == "Led2_on" or command == "Led2_off":
        device_name = "Quạt"
    elif command == "Led3_on" or command == "Led3_off":
        device_name = "Máy lạnh"
    elif command == "Led4_on" or command == "Led4_off":
        device_name = "Đèn bếp"
    elif command == "Led5_on" or command == "Led5_off":
        device_name = "Đèn tủ"

    if device_name:
        client.publish(mqtt_topic_control, command)
        record = {
            'device': device_name,
            'command': command,
            'timestamp': datetime.utcnow()  
        }
        device_control_history_collection.insert_one(record)
        return jsonify({"message": f"Lệnh '{command}' đã gửi đến điều khiển {device_name}"}), 200

    return jsonify({"error": "Lệnh không hợp lệ"}), 400

# Lịch sử dữ liệu cảm biến với phân trang
@app.route('/sensor_history', methods=['GET'])
def get_sensor_history():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    # Áp dụng các bộ lọc nếu có
    filters = {}
    if 'temperature' in request.args:
        filters['temperature'] = float(request.args['temperature'])
    if 'humidity' in request.args:
        filters['humidity'] = float(request.args['humidity'])
    if 'light' in request.args:
        filters['light'] = float(request.args['light'])
    if 'outdoor_temperature' in request.args:
        filters['outdoor_temperature'] = float(request.args['outdoor_temperature'])

    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')

    if start_time and end_time:
        filters['timestamp'] = {
            "$gte": datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S"),
            "$lte": datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S"),
        }

    data = list(sensor_collection.find(filters, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit))
    
    # Định dạng lại timestamp trong mỗi bản ghi trước khi trả về cho frontend
    for record in data:
        record['timestamp'] = format_timestamp(record['timestamp'])

    total_records = sensor_collection.count_documents(filters)

    return jsonify({"page": page, "limit": limit, "total_records": total_records, "data": data}), 200

# Tìm kiếm lịch sử điều khiển thiết bị
@app.route('/search_device_control', methods=['GET'])
def search_device_control():
    try:
        filters = {}

        # Kiểm tra bộ lọc tên thiết bị
        if 'device' in request.args:
            filters['device'] = request.args['device']

        # Bộ lọc thời gian
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')

        if start_time and end_time:
            try:
                start_dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
                end_dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
                filters['timestamp'] = {"$gte": start_dt, "$lte": end_dt}
            except ValueError:
                return jsonify({"error": "Định dạng ngày không hợp lệ. Định dạng đúng: YYYY-MM-DD HH:MM:SS"}), 400

        # Truy vấn MongoDB với bộ lọc
        data = list(device_control_history_collection.find(filters, {"_id": 0}))
        for record in data:
            record['timestamp'] = format_timestamp(record['timestamp'])

        if data:
            return jsonify(data), 200
        else:
            return jsonify({"error": "Không tìm thấy bản ghi phù hợp"}), 404

    except Exception as e:
        print("Lỗi xảy ra:", e)
        return jsonify({"error": "Lỗi hệ thống nội bộ"}), 500

# API lấy dữ liệu cảm biến mới nhất
@app.route('/latest_sensor_data', methods=['GET'])
def get_latest_sensor_data():
    # Lấy bản ghi cảm biến mới nhất từ MongoDB
    latest_data = sensor_collection.find_one(sort=[("timestamp", -1)], projection={"_id": 0})
    
    if latest_data:
        # Định dạng lại timestamp
        latest_data['timestamp'] = format_timestamp(latest_data['timestamp'])
        return jsonify(latest_data), 200
    else:
        return jsonify({"error": "Không tìm thấy dữ liệu cảm biến"}), 404

# API để xóa toàn bộ lịch sử dữ liệu cảm biến
@app.route('/clear_sensors', methods=['DELETE'])
def clear_sensors():
    # Xóa tất cả các bản ghi trong collection sensor_data
    result = sensor_collection.delete_many({})
    
    # Trả về thông báo với số bản ghi đã xóa
    return jsonify({"message": f"Đã xóa {result.deleted_count} bản ghi dữ liệu cảm biến"}), 200

# Lịch sử điều khiển thiết bị với phân trang và lọc
@app.route('/device_control_history', methods=['GET'])
def get_device_control_history():
    # Lấy các tham số phân trang
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    # Áp dụng các bộ lọc nếu có
    filters = {}
    if 'device' in request.args:
        filters['device'] = request.args['device']

    # Lọc theo khoảng thời gian
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')

    if start_time and end_time:
        try:
            start_dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
            end_dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
            filters['timestamp'] = {"$gte": start_dt, "$lte": end_dt}
        except ValueError:
            return jsonify({"error": "Định dạng ngày không hợp lệ. Định dạng đúng: YYYY-MM-DD HH:MM:SS"}), 400

    # Truy vấn MongoDB với bộ lọc và phân trang
    data = list(device_control_history_collection.find(filters, {"_id": 0})
                .sort("timestamp", -1).skip(skip).limit(limit))
    
    # Định dạng lại timestamp trong mỗi bản ghi
    for record in data:
        record['timestamp'] = format_timestamp(record['timestamp'])

    # Đếm tổng số bản ghi cho các bộ lọc đã áp dụng
    total_records = device_control_history_collection.count_documents(filters)

    # Trả về dữ liệu với thông tin phân trang
    return jsonify({"page": page, "limit": limit, "total_records": total_records, "data": data}), 200

# API để xóa toàn bộ lịch sử điều khiển thiết bị
@app.route('/clear_device_history', methods=['DELETE', 'OPTIONS'])
def clear_device_history():
    if request.method == 'OPTIONS':
        # Trả về phản hồi OK cho preflight request
        return jsonify({"message": "Preflight check successful"}), 200
    
    # Xóa toàn bộ lịch sử điều khiển thiết bị
    result = device_control_history_collection.delete_many({})
    return jsonify({"message": f"Đã xóa {result.deleted_count} bản ghi lịch sử điều khiển thiết bị"}), 200

# Cấu hình MQTT
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(mqtt_user, mqtt_password)
client.connect(mqtt_broker, mqtt_port, keepalive=60)  # 'keepalive' là thời gian chờ giữa các lần kết nối

client.loop_start()

# Khởi động server Flask
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
