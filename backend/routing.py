import networkx as nx


def find_best_route(network, source, destination):
    """
    Find the best available route based on
    delay, reliability and bandwidth.
    """

    if not nx.has_path(network, source, destination):
        return None

    best_route = None
    best_score = float("inf")

    
    for route in nx.all_simple_paths(network, source, destination):

        total_score = 0

        for i in range(len(route) - 1):
            current = route[i]
            next_node = route[i + 1]

            link = network[current][next_node]

            delay = link.get("delay", 1)
            reliability = link.get("reliability", 1)
            bandwidth = link.get("bandwidth", 100)

            
            score = (
                delay
                + (1 - reliability) * 10
                + (100 / max(bandwidth, 1))
            )

            total_score += score

        if total_score < best_score:
            best_score = total_score
            best_route = route

    return best_route


def create_space_network():
    """Create a sample space communication network."""

    network = nx.Graph()

    network.add_edge(
        "Earth",
        "Relay_A",
        delay=3,
        reliability=0.95,
        bandwidth=80
    )

    network.add_edge(
        "Relay_A",
        "Relay_B",
        delay=4,
        reliability=0.90,
        bandwidth=60
    )

    network.add_edge(
        "Relay_B",
        "Mars",
        delay=5,
        reliability=0.92,
        bandwidth=70
    )

    network.add_edge(
        "Earth",
        "Relay_C",
        delay=6,
        reliability=0.98,
        bandwidth=90
    )

    network.add_edge(
        "Relay_C",
        "Mars",
        delay=7,
        reliability=0.96,
        bandwidth=85
    )

    return network
def reroute_after_failure(network, source, destination):
    """
    Find an alternative route after a network link failure.
    """

    return find_best_route(
        network,
        source,
        destination
    )


if __name__ == "__main__":
    network =create_space_network()


    route = find_best_route(
        network,
        "Earth",
        "Mars"
    )

    print("Selected Route:", route)