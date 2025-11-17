class TeamStats:
    def __init__(self, name, data):
        self.name = name
        self.data = data

    def get_stat(self, key, default=None):
        return self.data.get(key, default)
