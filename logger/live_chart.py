# Sourced: https://makersportal.com/blog/2018/8/14/real-time-graphing-in-python
# Modified to support multiple lines and legend
from typing import Sized, Union

import matplotlib.pyplot as plt
import numpy as np

# use ggplot style for more sophisticated visuals
plt.style.use('ggplot')

lines = []


def live_plotter(x_vec: Union[list, np.ndarray], y1_datas: Union[list, np.ndarray], identifier='', pause_time=0.01,
                 labels=None):
    """
    Plot line graphs that update live
    :param x_vec: X axis labels. 1D array
    :param y1_datas: Y axis values. 2D array. First dimension is line graph, next is y values
    :param identifier: Graph title
    :param pause_time: time between graph rendering
    :param labels: Legend labels for lines.
    :return: the line graphs as an array.
    """
    global lines

    lines_amount = len(y1_datas)
    if not labels:
        labels = [str(x) for x in range(lines_amount)]

    if not lines:
        lines = [None] * lines_amount
        # this is the call to matplotlib that allows dynamic plotting
        plt.ion()
        fig = plt.figure(figsize=(13, 6))
        ax = fig.add_subplot(111)
        # create a variable for the line so we can later update it
        for i in range(lines_amount):
            # comma because ax.plot returns tuple
            lines[i], = ax.plot(x_vec, y1_datas[i], '-o', alpha=0.8, label=labels[i])

        # update plot label/title
        plt.ylabel('Y Label')
        plt.title('Title: {}'.format(identifier))
        ax.legend()
        plt.show()

    for i in range(lines_amount):
        y_data = y1_datas[i]
        line = lines[i]
        line.set_data(x_vec, y_data)
        # adjust limits if new data goes beyond bounds
        if np.min(y_data) <= line.axes.get_ylim()[0] or np.max(y_data) >= line.axes.get_ylim()[1]:
            plt.ylim([np.min(y_data) - np.std(y_data), np.max(y_data) + np.std(y_data)])

    # update x axis labels
    plt.xlim([x_vec[0], x_vec[-1]])

    # this pauses the data so the figure/axis can catch up - the amount of pause can be altered above
    plt.pause(pause_time)

    # return line so we can update it again in the next iteration
    return lines


# sample animation, and example for use
if __name__ == '__main__':
    size = 100
    x_vec = np.linspace(0, 1, size + 1)
    y_vec = [np.random.randn(len(x_vec)) for x in range(3)]
    while True:
        rand_val = np.random.randn(1)
        for y in y_vec:
            y[-1] = np.random.randn(1)
        live_plotter(x_vec, y_vec)
        # shift left
        for i in range(len(y_vec)):
            y_vec[i] = np.append(y_vec[i][1:], 0.0)
