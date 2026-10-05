class Node:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"Node({self.name})"


class Link:
    def __init__(
        self,
        source,
        destination,
        bandwidth,
        delay,
        reliability,
        contact_start=0,
        contact_end=None
    ):
        self.source = source
        self.destination = destination
        self.bandwidth = bandwidth
        self.delay = delay
        self.reliability = reliability
        self.status = "active"
        self.congested = False

        self.contact_start = contact_start
        self.contact_end = contact_end

    def fail(self):
        self.status = "failed"


    def restore(self):
        self.status = "active"

    def congest(self):
        self.congested = True

    def clear_congestion(self):
        self.congested = False    

    def __repr__(self):
        return (
            f"Link({self.source.name} -> {self.destination.name}, "
            f"status={self.status})"
        )


class Network:
    def __init__(self):
        self.nodes = {}
        self.links = []

    def add_node(self, name):
        node = Node(name)
        self.nodes[name] = node
        return node

    def add_link(
        self,
        source,
        destination,
        bandwidth,
        delay,
        reliability,
        contact_start=0,
        contact_end=None
    ):
        link = Link(
            source,
            destination,
            bandwidth,
            delay,
            reliability,
            contact_start,
            contact_end
        )
        self.links.append(link)
        return link

    def get_active_links(self):
        return [
            link for link in self.links
            if link.status == "active"
        ]
    def is_link_active(self, source_name, destination_name, current_time=0):
        for link in self.links:
            if (
                link.source.name == source_name
                and link.destination.name == destination_name
            ):
                if link.status != "active":
                    return False

                if link.congested:
                    return False    

                if current_time < link.contact_start:
                    return False

                if (
                    link.contact_end is not None
                    and current_time > link.contact_end
                ):
                    return False

                return True

        return False

    def is_link_congested(self, source_name, destination_name):
        for link in self.links:
            if (
                link.source.name == source_name
                and link.destination.name == destination_name
            ):
                return link.congested

        return False    
   
    def fail_link(self, source_name, destination_name):
        for link in self.links:
            if (
                link.source.name == source_name
                and link.destination.name == destination_name
            ):
                link.fail()
                return True

        return False

    def restore_link(self, source_name, destination_name):
        for link in self.links:
            if (
                link.source.name == source_name
                and link.destination.name == destination_name
            ):
                link.restore()
                return True

        return False
    
    def congest_link(self, source_name, destination_name):
        for link in self.links:
            if (
                link.source.name == source_name
                and link.destination.name == destination_name
            ):
                link.congest()
                return True
        return False


    def clear_link_congestion(self, source_name, destination_name):
        for link in self.links:
            if (
                link.source.name == source_name
                and link.destination.name == destination_name
            ):
                link.clear_congestion()
                return True
        return False




if __name__ == "__main__":

    network = Network()

    earth = network.add_node("Earth")
    relay_a = network.add_node("Relay_A")
    relay_b = network.add_node("Relay_B")
    mars = network.add_node("Mars")

    network.add_link(
        earth,
        relay_a,
        bandwidth=100,
        delay=5,
        reliability=0.95
    )

    network.add_link(
        relay_a,
        relay_b,
        bandwidth=80,
        delay=10,
        reliability=0.90
    )

    network.add_link(
        relay_b,
        mars,
        bandwidth=70,
        delay=15,
        reliability=0.92
    )

    print("All active links:")

    for link in network.get_active_links():
        print(link)

    print("\nFailing Relay_A -> Relay_B...")

    network.fail_link("Relay_A", "Relay_B")

    print("\nActive links after failure:")

    for link in network.get_active_links():
        print(link)       
    
    print("\nRestoring Relay_A -> Relay_B...")

    network.restore_link("Relay_A", "Relay_B")

    print("\nActive links after restoration:")

    for link in network.get_active_links():
        print(link)   
           
    print("\nChecking link status:")

    print(
        "Earth -> Relay_A:",
        network.is_link_active("Earth", "Relay_A")
    )

    print(
        "Relay_A -> Relay_B:",
        network.is_link_active("Relay_A", "Relay_B")
    )       