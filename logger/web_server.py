import os
import threading

import microfs
from flask import Flask, send_from_directory
from serial import Serial

app = Flask(__name__, static_folder='website')

com: Serial


# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


def start_webserver(port: int, serial: Serial):
    global com
    com = serial
    app.run(use_reloader=False, port=port, threaded=True, ssl_context=('certs/localhost.crt', 'certs/localhost.key'))


# functions sourced from: https://rmit.instructure.com/courses/67319/files/14841142
@app.route('/restart')
def restart_mb():
    wr = "import main" + chr(13)  # start the micro:bit program "main.py"
    com.write(wr.encode())
    return 'Micro:bit restarted <a href="/">Go back </a>'


@app.route('/stop')
def stop_mb():  # Stop the running progrma on micro:bit
    com.write('\x03'.encode())
    return 'Micro:bit stopped. <a href="/">Go back </a>'


@app.route('/reset')
def reset_mb():
    stop_mb()  # Reset without losing data or files
    wr = "from microbit import reset" + chr(13)
    wr += "reset()" + chr(13)  # use internal reset function
    com.write(wr.encode())  # to reset+run main.py if it exists
    return 'Micro:bit reset. <a href="/">Go back </a>'


def close_mb():  # close currently open serial port
    com.close()


# deprecated, microfs does this for us.
def open_mb():
    # Serial Vars
    port = "COM3"
    baud = 115200
    serial = Serial(port)
    serial.baudrate = 115200
    return serial


if __name__ == '__main__':
    serial = None
    try:
        serial = microfs.get_serial()
    except OSError:
        print("Couldn't init Micro:bit connection in Web-Only startup. Skipping...")
    start_webserver(8080, serial)
