import networkx as nx


def create_network():
    network = nx.Graph()

    
    nodes = [
        "Earth",
        "Relay_A",
        "Relay_B",
        "Relay_C",
        "Mars"
    ]

    network.add_nodes_from(nodes)

    
    network.add_edge(
        "Earth", "Relay_A",
        delay=3, reliability=0.95, bandwidth=80
    )

    network.add_edge(
        "Relay_A", "Relay_B",
        delay=4, reliability=0.90, bandwidth=60
    )

    network.add_edge(
        "Relay_B", "Mars",
        delay=5, reliability=0.92, bandwidth=70
    )

    network.add_edge(
        "Earth", "Relay_C",
        delay=6, reliability=0.98, bandwidth=90
    )

    network.add_edge(
        "Relay_C", "Mars",
        delay=7, reliability=0.96, bandwidth=85
    )

    return network


def disable_link(network, node1, node2):
    """Simulate a communication link failure."""

    if network.has_edge(node1, node2):
        network.remove_edge(node1, node2)
        print(f"LINK FAILURE: {node1} -> {node2}")


def restore_link(network, node1, node2, **properties):
    """Restore a failed communication link."""

    network.add_edge(node1, node2, **properties)
    print(f"LINK RESTORED: {node1} -> {node2}")


if __name__ == "__main__":

    network = create_network()

    print("SPACE NETWORK")
    print("Nodes:", list(network.nodes))
    print("Links:", list(network.edges))

    print("\nSimulating link failure...")
    disable_link(network, "Relay_C", "Mars")

    print("\nAvailable links:")
    print(list(network.edges))