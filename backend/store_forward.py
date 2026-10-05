class StoreAndForward:
    def __init__(self):
        self.buffer = []

    def store_message(self, message):
        """Store a message when no route is available."""
        self.buffer.append(message)
        print("Message stored:", message["message_id"])

    def get_pending_messages(self):
        """Return messages waiting for delivery."""
        return self.buffer

    def retry_messages(self):
        """Return stored messages for retry."""
        messages = self.buffer
        self.buffer = []
        return messages


if __name__ == "__main__":

    storage = StoreAndForward()

    message = {
        "message_id": "MSG-004",
        "priority": 85,
        "data": "Mission telemetry"
    }

    storage.store_message(message)

    print("Pending messages:", storage.get_pending_messages())

    retry = storage.retry_messages()

    print("Retrying messages:", retry)