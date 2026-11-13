import heapq
import time


class MessageScheduler:
    def __init__(self):
        self.queue = []
        self.counter = 0

    def add_message(self, message_id, priority_score, deadline, size):
        """
        Add a message to the transmission queue.
        Higher priority messages are transmitted first.
        """

        message = {
            "message_id": message_id,
            "priority": priority_score,
            "deadline": deadline,
            "size": size,
            "arrival_time": time.time()
        }

        # Python heap is a min-heap,
        # so negative priority gives highest priority first.
        heapq.heappush(
            self.queue,
            (-priority_score, self.counter, message)
        )

        self.counter += 1

    def get_next_message(self):
        """Return the next message to transmit."""

        if not self.queue:
            return None

        _, _, message = heapq.heappop(self.queue)

        return message

    def pending_messages(self):
        """Return the number of waiting messages."""

        return len(self.queue)


if __name__ == "__main__":

    scheduler = MessageScheduler()

    scheduler.add_message("MSG-001", 45, 30, 20)
    scheduler.add_message("MSG-002", 90, 10, 10)
    scheduler.add_message("MSG-003", 70, 20, 15)

    print("Messages waiting:", scheduler.pending_messages())

    while scheduler.pending_messages() > 0:

        message = scheduler.get_next_message()

        print(
            "Transmitting:",
            message["message_id"],
            "| Priority:",
            message["priority"]
        )