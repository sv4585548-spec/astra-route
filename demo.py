from network import Network
from messages import Message
from simulation import Simulation
from integrity import calculate_hash, verify_integrity


def create_demo_simulation():
    simulation = Simulation()

    # Create network nodes
    earth = simulation.network.add_node("Earth")
    relay_a = simulation.network.add_node("Relay_A")
    relay_b = simulation.network.add_node("Relay_B")
    relay_c = simulation.network.add_node("Relay_C")
    mars = simulation.network.add_node("Mars")

    # Primary route
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
        reliability=0.90
    )

    simulation.network.add_link(
        relay_b,
        mars,
        bandwidth=70,
        delay=15,
        reliability=0.92
    )

    # Alternative route
    simulation.network.add_link(
        earth,
        relay_c,
        bandwidth=90,
        delay=6,
        reliability=0.98
    )

    simulation.network.add_link(
        relay_c,
        mars,
        bandwidth=85,
        delay=7,
        reliability=0.96
    )

    return simulation


def create_message():
    return Message(
        message_id="M001",
        source="Earth",
        destination="Mars",
        size=10,
        priority="HIGH",
        deadline=60
    )


def show_route(simulation, message):
    route = simulation.find_route(
        message.current_node,
        message.destination
    )

    print("Selected route:", route)


def run_demo():
    print("=" * 60)
    print("ASTRA-ROUTE DISRUPTION-TOLERANT ROUTING DEMO")
    print("=" * 60)

    simulation = create_demo_simulation()
    message = create_message()

    print("\n--- 1. NORMAL ROUTING ---")

    show_route(simulation, message)

    while message.current_node != message.destination:
        if not simulation.route_message(message):
            break

    print("Message location:", message.current_node)

    if message.current_node == message.destination:
        simulation.deliver_message(message)

    print("Final status:", message.status)

    print("\n--- 2. LINK FAILURE AND REROUTING ---")

    simulation = create_demo_simulation()
    message = create_message()

    simulation.network.fail_link(
        "Earth",
        "Relay_A"
    )

    print("Earth -> Relay_A link FAILED")

    show_route(simulation, message)

    while message.current_node != message.destination:
        if not simulation.route_message(message):
            break

    print("Message location:", message.current_node)

    if message.current_node == message.destination:
        simulation.deliver_message(message)

    print("Final status:", message.status)

    print("\n--- 3. CONGESTION AND REROUTING ---")

    simulation = create_demo_simulation()
    message = create_message()

    simulation.network.congest_link(
        "Earth",
        "Relay_A"
    )

    print("Earth -> Relay_A link CONGESTED")

    show_route(simulation, message)

    while message.current_node != message.destination:
        if not simulation.route_message(message):
            break

    print("Message location:", message.current_node)

    if message.current_node == message.destination:
        simulation.deliver_message(message)

    print("Final status:", message.status)

    print("\n--- 4. NO ROUTE AND BUFFERING ---")

    simulation = create_demo_simulation()
    message = create_message()

    simulation.network.fail_link(
        "Earth",
        "Relay_A"
    )

    simulation.network.fail_link(
        "Earth",
        "Relay_C"
    )

    print("Both Earth outgoing links FAILED")

    result = simulation.route_message(message)

    print("Transmission result:", result)
    print("Message status:", message.status)

    print("\n--- 5. INTEGRITY VERIFICATION ---")

    data = "Emergency data from Earth to Mars"

    original_hash = calculate_hash(data)

    print("Original data hash calculated.")

    if verify_integrity(original_hash, data):
        print("Integrity check: PASSED")
    else:
        print("Integrity check: FAILED")

    print("\n--- DEMO COMPLETE ---")
    print("=" * 60)


if __name__ == "__main__":
    run_demo()
    