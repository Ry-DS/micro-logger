import threading


# define a thread which takes input
class InputThread(threading.Thread):
    def __init__(self, command_message):
        super(InputThread, self).__init__()
        self.command_message = command_message
        self.daemon = True
        self.last_user_input = None

    def run(self):

        while True:
            self.last_user_input = input(self.command_message)
            if self.last_user_input == 'stop':
                break

