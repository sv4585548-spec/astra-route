from network import Network

from messages import Message

from integrity import calculate_hash, verify_integrity

from network_adapter import convert_to_networkx

from backend.routing import find_best_route

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

        self.add_event(
            f"Simulation time advanced by {seconds} seconds."
        )

    def find_route(self, source, destination):
        graph = convert_to_networkx(
            self.network,
            self.time
        )

        return find_best_route(
            graph,
            source,
            destination
        )

    def get_next_hop(self, message):
        route = self.find_route(
            message.current_node,
            message.destination
        )

        if route is None:
            self.buffer_message(message)

            self.add_event(
                f"No available route for {message.message_id} "
                f"from {message.current_node} to "
                f"{message.destination}."
            )

            return None

        if len(route) < 2:
            return None

        return route[1]    

    def route_message(self, message):
        if not self.check_deadline(message):
            return False

        next_node = self.get_next_hop(message)

        if next_node is None:
            return False

        return self.move_message(message, next_node)    

    def check_deadline(self, message):
        if self.time > message.deadline:
            self.add_event(
                f"Message {message.message_id} missed its deadline."
            )
            return False

        return True


    def move_message(self, message, next_node):
        current_node = message.current_node

        if current_node == next_node:
            return False
        
        if not self.check_deadline(message):
            return False

        if not self.network.is_link_active(
            current_node,
            next_node,
            self.time
        ):
            self.buffer_message(message)

            if self.network.is_link_congested(
                current_node,
                next_node
            ):
                self.add_event(
                    f"Cannot move {message.message_id}: "
                    f"link {current_node} -> {next_node} is congested."
                )
            else:
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
        if message.current_node != message.destination:
            self.add_event(
                f"Cannot deliver {message.message_id}: "
                f"message has not reached its destination."
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

    message_data = "Emergency data from Earth to Mars"
    original_hash = calculate_hash(message_data)

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

        received_data = "Emergency data from Earth to Mars"
        if verify_integrity(original_hash, received_data):
            simulation.add_event(
                "Message integrity verified successfully."
            )
            simulation.deliver_message(message)
        else:
            simulation.add_event(
                "Message integrity verification failed."
            )  

   
    print("\nFinal message status:")
    print(message)

    print("\nSimulation events:")

    for event in simulation.events:
        print("-", event)

    