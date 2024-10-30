import paho.mqtt.client as mqtt
from pymongo import MongoClient
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
# MongoDB setup
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['iot_system']
sensor_collection = db['sensor_data']
device_control_history_collection = db['device_control_history']

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
# MQTT Broker information
mqtt_broker = "172.20.10.6"
mqtt_port = 1993
mqtt_user = "huy"
mqtt_password = "0123456789"
mqtt_topic_data = "datasensors"
mqtt_topic_control = "controllight"

# MQTT client setup
client = mqtt.Client()

# MQTT connection and message handlers
def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with code {rc}")
    client.subscribe(mqtt_topic_data)

def on_message(client, userdata, message):
    msg = message.payload.decode()
    print(f"Received message: {msg}")
    data_parts = msg.split(',')
    temperature = float(data_parts[0].split(':')[1].strip().split(' ')[0])
    humidity = float(data_parts[1].split(':')[1].strip().split(' ')[0])
    light = float(data_parts[2].split(':')[1].strip().split(' ')[0])
    sensor_data = {
        'temperature': temperature,
        'humidity': humidity,
        'light': light,
        'timestamp': datetime.utcnow()
    }
    sensor_collection.insert_one(sensor_data)
    print("Sensor data saved to MongoDB")

# Format timestamp
def format_timestamp(timestamp):
    return timestamp.strftime("%d/%m/%Y %H:%M:%S")

# API to control LED lights
@app.route('/control_light', methods=['POST'])
def control_light():
    data = request.json
    command = data.get('command')
    if command in ["Led1_on", "Led1_off", "Led2_on", "Led2_off", "Led3_on", "Led3_off"]:
        client.publish(mqtt_topic_control, command)
        record = {
            'device': 'LED',
            'command': command,
            'timestamp': datetime.utcnow()
        }
        device_control_history_collection.insert_one(record)
        return jsonify({"message": f"Command '{command}' sent to control LED"}), 200
    return jsonify({"error": "Invalid command"}), 400

# Sensor data history with pagination
@app.route('/sensor_history', methods=['GET'])
def get_sensor_history():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    data = list(sensor_collection.find({}, {"_id": 0}).sort("timestamp", -1) .skip(skip).limit(limit))
    for record in data: 
        record['timestamp'] = format_timestamp(record['timestamp'])
    total_records = sensor_collection.count_documents({})
    return jsonify({"page": page, "limit": limit, "total_records": total_records, "data": data}), 200

# Device control history with pagination
@app.route('/device_control_history', methods=['GET'])
def get_device_control_history():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    history = list(device_control_history_collection.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit))
    for record in history:
        record['timestamp'] = format_timestamp(record['timestamp'])
    total_records = device_control_history_collection.count_documents({})
    return jsonify({"page": page, "limit": limit, "total_records": total_records, "data": history}), 200

# Search for specific sensor data
from datetime import datetime

@app.route('/search_sensor', methods=['GET'])
def search_sensor():
    try:
        filters = {}

        # Chuyển đổi kiểu dữ liệu cho từng tham số nếu có
        if request.args.get('temperature'):
            try:
                filters['temperature'] = float(request.args.get('temperature'))
            except ValueError:
                return jsonify({"error": "Invalid temperature value"}), 400

        if request.args.get('humidity'):
            try:
                filters['humidity'] = float(request.args.get('humidity'))
            except ValueError:
                return jsonify({"error": "Invalid humidity value"}), 400

        if request.args.get('light'):
            try:
                filters['light'] = int(request.args.get('light'))
            except ValueError:
                return jsonify({"error": "Invalid light value"}), 400

        # Thêm bộ lọc thời gian (start_time và end_time)
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')

        if start_time and end_time:
            try:
                # Chuyển đổi start_time và end_time thành datetime
                start_dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
                end_dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
                filters['timestamp'] = {"$gte": start_dt, "$lte": end_dt}
            except ValueError:
                return jsonify({"error": "Invalid date format. Expected format: YYYY-MM-DD HH:MM:SS"}), 400

        # Truy vấn MongoDB với bộ lọc
        if filters:
            data = list(sensor_collection.find(filters, {"_id": 0}))

            # Định dạng lại timestamp trước khi trả về
            for record in data:
                if 'timestamp' in record:
                    record['timestamp'] = format_timestamp(record['timestamp'])

            # Trả về dữ liệu nếu có, hoặc thông báo không tìm thấy
            if data:
                return jsonify(data), 200
            else:
                return jsonify({"error": "No matching records found"}), 404

        # Nếu không có bộ lọc nào được cung cấp
        return jsonify({"error": "No matching records found"}), 404

    except Exception as e:
        print("Error occurred:", e)
        return jsonify({"error": "An internal server error occurred"}), 500



# Clear sensor data
@app.route('/clear_sensors', methods=['DELETE'])
def clear_sensors():
    result = sensor_collection.delete_many({})
    return jsonify({"message": f"Deleted {result.deleted_count} sensor records"}), 200

# Clear all LED control history
@app.route('/clear_device_history', methods=['DELETE'])
def clear_device_history():
    result = device_control_history_collection.delete_many({})
    return jsonify({"message": f"Deleted {result.deleted_count} device control history records"}), 200

# Latest sensor data
@app.route('/latest_sensor_data', methods=['GET'])
def get_latest_sensor_data():
    latest_data = sensor_collection.find_one(sort=[("timestamp", -1)], projection={"_id": 0})
    if latest_data:
        latest_data['timestamp'] = format_timestamp(latest_data['timestamp'])
        return jsonify(latest_data), 200
    else:
        return jsonify({"error": "No sensor data found"}), 404

# MQTT configuration
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(mqtt_user, mqtt_password)
client.connect(mqtt_broker, mqtt_port)
client.loop_start()

# Run Flask server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
