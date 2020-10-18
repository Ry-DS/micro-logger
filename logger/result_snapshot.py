class ResultSnapshot:
    """
    Represents a result taken at a particular time.
    """

    def __init__(self, timestamp: int, time_took: int, sensor_dict: dict):
        self.sensor_dict = sensor_dict
        self.time_took = time_took
        self.timestamp = timestamp

    def to_csv_line(self):
        """
        Converts this snapshot to a CSV line to be stored.
        :return: a string CSV of this object timestamp,time_took,...sensor_values
        """
        values = [self.timestamp, self.time_took]
        values.extend(self.sensor_dict.values())
        return ','.join(map(str, values))
