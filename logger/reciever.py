# https://forum.micropython.org/viewtopic.php?f=2&t=8153 for writing from PC to microbit
import json
import os
import signal
import sys
import threading
from typing import List, Iterable

import numpy as np
import microfs
from web_server import start_webserver
import time

from live_chart import live_plotter
from result_snapshot import ResultSnapshot

# Serial Vars
port = "COM3"
baud = 115200
serial = microfs.get_serial()

# Data Dump File
CSV_FILE_NAME = 'dump.csv'
FOLDER_NAME = 'sensors'

result_count = 0
# of type List[ResultSnapshot | None]
results = []


def main():
    global result_count
    last_result_time = int(time.time() * 1000)
    print('Waiting for first response from Micro:bit...')
    while True:
        data = serial.readline().decode().replace('\n', '').replace('\r', '')
        if '?~EPOCH Time' in data:
            serial.write((str(int(time.time() * 1000)) + '\r').encode())

        print(data, end='\r')
        # Only command we're interested in from now on
        if 'LOG' not in data:
            continue
        try:
            sections = data.split('~')
            timestamp = int(sections[2])
            time_took = timestamp - last_result_time
            sensor_dict = json.loads(sections[3])
            result_count = int(sections[1])
            snapshot = ResultSnapshot(timestamp, time_took, sensor_dict)

            # Plotting all the sensors using matplotlib.
            # Area of improvement: group sensors in different charts.
            # The temperature sensor always is between 15-30 and ACC values jump to 1000 making it hard to read
            # this lags the program quite a bit. Commenting out could reduce sample time by a factor of 3
            if len(sys.argv) < 2 or 'headless' not in sys.argv[1]:
                plot_coords(list(sensor_dict.values()), list(sensor_dict.keys()))

            log(snapshot)

            if result_count % 5 == 0:
                dump_results(sensor_dict.keys())

            last_result_time = timestamp
            send_command('ACK')

        except Exception as e:
            # Any error means the result is malformed, so lets re-request it.
            print(e)
            send_command('NAK')


graph_data = None


def plot_coords(coords: List[int], labels: List[str], sample_density=100):
    """
    Plots the sensors on a graph
    :param coords: The y values to plot
    :param labels: The Legend values. Must be same length as coords
    :param sample_density: the length of the x axis. 100 by default
    """
    global graph_data
    size = len(coords)
    if not graph_data:
        graph_data = [[0] * 100] * size
    for i in range(size):
        graph_data[i][-1] = coords[i]

    live_plotter(np.linspace(result_count - sample_density, result_count, sample_density), graph_data,
                 identifier='Sensor Values',
                 labels=labels)
    for i in range(size):
        graph_data[i] = np.append(graph_data[i][1:], 0.0)


def log(result: ResultSnapshot):
    """
    Logs a CSV result for later saving
    :param result: the result to store
    """
    global results
    try:
        results[result_count] = result
    except IndexError:
        results.append(None)
        # we recursively try store the result,
        # since its possible the list isn't big enough for the current result_count
        log(result)


def dump_results(sensor_names: Iterable[str]):
    """
    Save the currently buffered results to a file (overwrites any old one)
    Creates a CSV file with all sensor values (for website)
    on top of a JSON file for each sensor (as per assignment spec)
    :param sensor_names: Sensor names to render
    :return:
    """
    # Save CSV
    with open(CSV_FILE_NAME, 'w') as file:
        output = [res.to_csv_line() + '\n' if res else '' for res in results]
        # header
        output.insert(0, f'timestamp,time_took,{",".join(sensor_names)}' + '\n')
        file.writelines(output)

    # Make sensors folder
    if not os.path.exists(FOLDER_NAME):
        os.makedirs(FOLDER_NAME)
    # Individual Sensor JSON
    for sensor_name in sensor_names:
        with open(f'{FOLDER_NAME}/{sensor_name}.json', 'w') as file:
            output = [{"timestamp": res.timestamp, "time_took": res.time_took,
                       "value": res.sensor_dict[sensor_name]} if res else {}
                      for res in results]
            json.dump(output, file, indent=4)

    print('')
    print(f'Dumped {result_count + 1} results')
    print('')


def send_command(command: str):
    """
    Send a command to the micro:bit
    :param command: command to send
    """
    serial.write(f'{command}\r'.encode())


if __name__ == '__main__':
    # Program close on keyboard interrupt
    signal.signal(signal.SIGINT, lambda x, y: sys.exit(0))
    threading.Thread(target=main).start()
    start_webserver(8080, serial)
