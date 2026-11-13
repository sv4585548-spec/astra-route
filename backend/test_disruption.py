from routing import create_space_network, find_best_route, reroute_after_failure


network = create_space_network()

print("=== NORMAL NETWORK ===")

route = find_best_route(
    network,
    "Earth",
    "Mars"
)

print("Normal Route:", route)


print("\n=== NETWORK DISRUPTION ===")


network.remove_edge("Earth", "Relay_A")

print("Link Earth -> Relay_A FAILED")


new_route = reroute_after_failure(
    network,
    "Earth",
    "Mars"
)

if new_route:
    print("Alternative Route:", new_route)
    print("Status: REROUTED SUCCESSFULLY")
else:
    print("No alternative route available.")
    print("Status: STORE AND FORWARD")