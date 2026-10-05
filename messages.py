class Message:
    def __init__(
        self,
        message_id,
        source,
        destination,
        size,
        priority,
        deadline
    ):
        self.message_id = message_id
        self.source = source
        self.destination = destination
        self.size = size
        self.priority = priority
        self.deadline = deadline

        self.current_node = source
        self.status = "waiting"

    def update_location(self, node):
        self.current_node = node
        self.status = "in_transit"

    def mark_buffered(self):
        self.status = "buffered"

    def mark_delivered(self):
        self.current_node = self.destination
        self.status = "delivered"

    def __repr__(self):
        return (
            f"Message("
            f"id={self.message_id}, "
            f"source={self.source}, "
            f"destination={self.destination}, "
            f"status={self.status})"
        )


if __name__ == "__main__":

    message = Message(
        message_id="M001",
        source="Earth",
        destination="Mars",
        size=10,
        priority="HIGH",
        deadline=60
    )

    print("Created message:")
    print(message)

    print("\nMoving message to Relay_A...")

    message.update_location("Relay_A")
    print(message)

    print("\nBuffering message...")

    message.mark_buffered()
    print(message)

    print("\nDelivering message...")

    message.mark_delivered()
    print(message)