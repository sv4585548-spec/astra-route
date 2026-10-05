from network import Network

from messages import Message



class Simulation:

    def __init__(self):

        self.network = Network()

        self.time = 0

        self.events = []

        self.processed_messages = set()


    def add_event(self, event):

        self.events.append(event)

        print(f"[TIME {self.time}] {event}")


    def advance_time(self, seconds):

        self.time += seconds

        self.add_event(f"Simulation time advanced by {seconds} seconds.")
    
    def move_message(self, message, next_node):
        current_node = message.current_node

        if current_node == next_node:
            return False

        if not self.network.is_link_active(
            current_node,
            next_node,
            self.time
        ):
            self.buffer_message(message)

            self.add_event(
                f"Cannot move {message.message_id}: "
                f"link {current_node} -> {next_node} is unavailable."
            )

            return False

        message.update_location(next_node)

        self.add_event(
            f"Message {message.message_id} moved "
            f"from {current_node} to {next_node}."
        )

        return True
     
    

    def buffer_message(self, message):
        message.mark_buffered()
        self.add_event(
            f"Message {message.message_id} was buffered."
        )

    def retry_message(self, message, next_node):                                                                   
        if message.status != "buffered":
            return False

        return self.move_message(message, next_node)

    def deliver_message(self, message):
        if message.message_id in self.processed_messages:
            self.add_event(
                f"Duplicate message {message.message_id} ignored."
            )
            return False

        message.mark_delivered()

        self.processed_messages.add(message.message_id)

        self.add_event(
            f"Message {message.message_id} delivered to "
            f"{message.destination}."
        )

        return True


if __name__ == "__main__":

    simulation = Simulation()

    
    earth = simulation.network.add_node("Earth")
    relay_a = simulation.network.add_node("Relay_A")
    relay_b = simulation.network.add_node("Relay_B")
    mars = simulation.network.add_node("Mars")

    
    simulation.network.add_link(
        earth,
        relay_a,
        bandwidth=100,
        delay=5,
        reliability=0.95
    )

    simulation.network.add_link(
        relay_a,
        relay_b,
        bandwidth=80,
        delay=10,
        reliability=0.90,
        contact_start=20,
        contact_end=40
    )

    simulation.network.add_link(
        relay_b,
        mars,
        bandwidth=70,
        delay=15,
        reliability=0.92
    )

    
    message = Message(
        message_id="M001",
        source="Earth",
        destination="Mars",
        size=10,
        priority="HIGH",
        deadline=60
    )

    simulation.add_event(
        f"Message {message.message_id} created at {message.source}."
    )

    
    simulation.move_message(message, "Relay_A")

    
  

    simulation.move_message(
        message,
        "Relay_B"
    )

    simulation.advance_time(10)


    simulation.retry_message(
        message,
        "Relay_B"
    )


    simulation.advance_time(10)


    if simulation.retry_message(
        message,
        "Relay_B"
    ):

        simulation.move_message(
            message,
            "Mars"
        )

        simulation.deliver_message(message)

   
    print("\nFinal message status:")
    print(message)

    print("\nSimulation events:")

    for event in simulation.events:
        print("-", event)

    