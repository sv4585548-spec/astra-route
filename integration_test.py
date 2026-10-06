from network import Network
from messages import Message
from simulation import Simulation
from backend.routing import create_space_network, find_best_route


print("=" * 60)
print("ASTRA-ROUTE BACKEND + SIMULATION INTEGRATION TEST")
print("=" * 60)


# --------------------------------------------------
# 1. Test Person 1's routing engine
# --------------------------------------------------

routing_network = create_space_network()

route = find_best_route(
    routing_network,
    "Earth",
    "Mars"
)

print("\n[1] ROUTING ENGINE")
print("Selected route:", route)


# --------------------------------------------------
# 2. Create your simulation network
# --------------------------------------------------

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
    reliability=0.90
)

simulation.network.add_link(
    relay_b,
    mars,
    bandwidth=70,
    delay=15,
    reliability=0.92
)


# --------------------------------------------------
# 3. Create message
# --------------------------------------------------

message = Message(
    message_id="M001",
    source="Earth",
    destination="Mars",
    size=10,
    priority="HIGH",
    deadline=60
)

print("\n[2] MESSAGE")
print(message)


# --------------------------------------------------
# 4. Route message through simulation
# --------------------------------------------------

print("\n[3] SIMULATION ROUTING")

while message.current_node != message.destination:

    result = simulation.route_message(message)

    if not result:
        print("Message could not move.")
        break

    print("Current location:", message.current_node)


# --------------------------------------------------
# 5. Deliver message
# --------------------------------------------------

if message.current_node == message.destination:

    simulation.deliver_message(message)

    print("\n[4] DELIVERY")
    print("Message delivered successfully.")

else:

    print("\n[4] DELIVERY")
    print("Message was not delivered.")


print("\nFinal status:", message.status)

print("=" * 60)