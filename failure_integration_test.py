from simulation import Simulation
from messages import Message


print("=" * 60)
print("ASTRA-ROUTE FAILURE + ROUTING INTEGRATION TEST")
print("=" * 60)


# --------------------------------------------------
# 1. Create simulation network
# --------------------------------------------------

simulation = Simulation()

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


# --------------------------------------------------
# 2. Create message
# --------------------------------------------------

message = Message(
    message_id="M002",
    source="Earth",
    destination="Mars",
    size=10,
    priority="HIGH",
    deadline=60
)


# --------------------------------------------------
# 3. Normal route
# --------------------------------------------------

print("\n[1] NORMAL NETWORK")

route = simulation.find_route(
    "Earth",
    "Mars"
)

print("Selected route:", route)


# --------------------------------------------------
# 4. Fail Earth -> Relay_C
# --------------------------------------------------

print("\n[2] SIMULATING LINK FAILURE")

simulation.network.fail_link(
    "Earth",
    "Relay_C"
)

print("Earth -> Relay_C FAILED")


# --------------------------------------------------
# 5. Find new route
# --------------------------------------------------

print("\n[3] REROUTING")

new_route = simulation.find_route(
    "Earth",
    "Mars"
)

print("New route:", new_route)


# --------------------------------------------------
# 6. Move message using new route
# --------------------------------------------------

print("\n[4] MESSAGE TRANSMISSION")

while message.current_node != message.destination:

    result = simulation.route_message(message)

    if not result:
        print("Message could not move.")
        break

    print("Current location:", message.current_node)


# --------------------------------------------------
# 7. Deliver
# --------------------------------------------------

if message.current_node == message.destination:

    simulation.deliver_message(message)

    print("\nMessage delivered successfully.")

else:

    print("\nMessage was not delivered.")


print("Final status:", message.status)

print("=" * 60)
