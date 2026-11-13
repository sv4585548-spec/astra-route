from priority import calculate_priority, get_priority_level
from scheduler import MessageScheduler
from routing import create_space_network, find_best_route
from store_forward import StoreAndForward


def process_message(message):
    print("\n--- ASTRA-ROUTE MESSAGE PROCESSING ---")

    
    priority_score = calculate_priority(
        message["mission_importance"],
        message["urgency"],
        message["deadline_pressure"],
        message["waiting_time"]
    )

    priority_level = get_priority_level(priority_score)

    print("Message:", message["message_id"])
    print("Priority Score:", priority_score)
    print("Priority Level:", priority_level)

    
    scheduler = MessageScheduler()

    scheduler.add_message(
        message["message_id"],
        priority_score,
        message["deadline"],
        message["size"]
    )

    print("Message added to scheduler.")


    network = create_space_network()

    
    route = find_best_route(
        network,
        message["source"],
        message["destination"]
    )

    
    if route:
        print("Selected Route:", route)
        print("Status: READY FOR TRANSMISSION")

    else:
        storage = StoreAndForward()

        storage.store_message(message)

        print("Status: STORED FORWARD")
        print("Message will be retried when a route becomes available.")


if __name__ == "__main__":

    message = {
        "message_id": "MSG-001",
        "mission_importance": 90,
        "urgency": 80,
        "deadline_pressure": 75,
        "waiting_time": 30,
        "deadline": 10,
        "size": 20,
        "source": "Earth",
        "destination": "Mars"
    }

    process_message(message)