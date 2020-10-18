import sys

from microbit import *

# for display and telling PC what result num its sending
result_count = 0
# Time keeping
epoch_start_time = 0
start_time = 0
# to resend if PC fails to get message. Only thing we need in Stop and Wait ACK
# Microbit doesn't have enough memory anyway to store more than this.
last_line = ''


def main():
    global result_count
    global last_line
    global epoch_start_time
    global start_time
    # Spin clock backwards as we wait for time to be set.
    display.show(tuple(reversed(Image.ALL_CLOCKS)), loop=True, wait=False)
    print('?~EPOCH Time')
    epoch_start_time = int(input())
    start_time = running_time()

    while True:
        data = {"acc_x": accelerometer.get_x(),
                "acc_y": accelerometer.get_y(),
                "acc_z": accelerometer.get_z(),
                "temp": temperature(),
                # compass takes too long to calibrate for rapid debugging. Comment our for testing
                "compass":
                compass.heading()
                    # 0
                }

        # I don't think string formatting f'' is supported in micropython
        # Packet Format:
        # Command:Data
        # For LOG command - LOG~result_number~epoch_time~sensor JSON
        last_line = 'LOG~' + str(result_count) + '~' + str(get_epoch_time()) + '~' + to_json(data)
        print(last_line)
        pulse_display()
        wait_for_ack()
        result_count += 1


def wait_for_ack(timeout=2000):
    """
    Keeps recursively waiting for the PC to send ACK packets acknowledging it got our latest message
    If we get an invalid ACK packet, we resend the last sent line.
    If the PC waits too long to send a ACK packet, we resend the last sent line

    Due to MicroPython limits, recursion to 10 layers is supported, so this function nicely crashes
    the program after 10 tries indicating that the PC likely isn't connected anymore.
    :param timeout Time to wait before we timeout and resend the last line anyway.
    """
    start = running_time()
    command = ''

    try:
        while running_time() - start < timeout:
            # we use uart instead of input cause we need a lot more control over things like timeout.
            line = uart.readline()
            if not line:
                continue
            packet = str(line, 'utf-8')
            command += packet
            # \r indicates end of input
            if '\r' in command:
                command = command.replace('\r', '')
                break

        # command is empty, PC never responded
        if not command:
            display.show(Image.ALL_CLOCKS, loop=True, wait=False, delay=int(timeout / len(Image.ALL_CLOCKS)))
            print(last_line + '~TIMEOUT')
            wait_for_ack()
        # We just treat everything else as a NAK command. ACK means we can just return and continue the program
        if 'ACK' not in command:
            # a point of improvement is manually creating an exclamation image, instead of scrolling it.
            display.scroll('!', wait=False)
            print(last_line + '~NAK')
            wait_for_ack()
    except RuntimeError:
        display.show(Image.NO)
        sys.exit("ERR:PC Failed to respond correctly")


pulse = False


def pulse_display():
    global pulse
    """
    Since we take so many samples to create our cool website animations,
    we use binary to display the amount of samples we sent to the user.
    A great way to put our knowledge in Binary to use.

    The screen has 25 lights.
    If we save two to indicate when data is being sent (pulse lights) we can use the remaining 23.
    2^23 ~= 8 million samples before we run into any issues.
    """
    binary = num_to_binary(result_count)
    display.clear()
    for y in range(5):
        for x in range(5):
            if y == 4 and x >= 3:
                # leave the last two lights for pulsing indicating that logging is happening
                continue
            index = y * 5 + x

            display.set_pixel(x, y, 9 if len(binary) > index and binary[index] else 0)
    # pulse last two lights to indicate transfer
    display.set_pixel(3, 4, 9 if pulse else 0)
    display.set_pixel(4, 4, 0 if pulse else 9)
    pulse = not pulse


def num_to_binary(num: int) -> list:
    """
    Takes an int and returns it in binary form.
    :param num: number to convert
    :return: number in binary, in boolean form. 5 returns [True, False, True] (101)
    """
    arr = []
    # we use the dividing technique we learnt in class. Keep dividing by two until you get 0, and store the remainders.
    while num >= 1:
        arr.insert(0, num % 2 == 1)
        num //= 2
    return arr


def get_epoch_time():
    """
    Get EPOC time, assuming time was set at beginning
    :return: EPOCH time in ms
    """
    time_passed = running_time() - start_time
    return epoch_start_time + time_passed


def to_json(data: dict):
    """
    Convert input dict to JSON.
    Sadly Microbit doesn't have json module, so we do this manually.
    Very limited. Only designed to fit our needs (str keys, int values)
    :param data: data to make to json
    :return:
    """
    ret = '{'
    for k, v in data.items():
        ret += '"{}": {}, '.format(k, v)
    # We have to use a lot of basic functions here instead of pythons list compressions
    # like list[:-1] because they aren't supported
    # here, we're trying to remove the last comma space
    ret = ret.rsplit(', ', 1)
    ret = ''.join(ret)
    ret += '}'
    return ret


if __name__ == '__main__':
    # To send data to PC
    # We run it here, because this is the only command that isn't supported on PC
    # Makes it possible to rapidly test this file's functions before uploading to Microbit
    uart.init(baudrate=115200)
    main()
