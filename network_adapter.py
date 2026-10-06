import networkx as nx


def convert_to_networkx(network, current_time=0):
    """
    Convert the simulation Network into a NetworkX graph.

    Only links that are currently active, within their
    contact window, and not congested are added.
    """

    graph = nx.Graph()

    # Add all nodes
    for node_name in network.nodes:
        graph.add_node(node_name)

    # Add currently usable links
    for link in network.links:

        if network.is_link_active(
            link.source.name,
            link.destination.name,
            current_time
        ):
            graph.add_edge(
                link.source.name,
                link.destination.name,
                bandwidth=link.bandwidth,
                delay=link.delay,
                reliability=link.reliability
            )

    return graph