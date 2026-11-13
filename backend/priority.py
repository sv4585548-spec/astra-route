def calculate_priority(mission_importance, urgency, deadline_pressure, waiting_time):
    """
    Calculate the priority score of a space-data message.

    All input values should be between 0 and 100.
    """

    priority_score = (
        0.40 * mission_importance
        + 0.30 * urgency
        + 0.20 * deadline_pressure
        + 0.10 * waiting_time
    )

    return round(priority_score, 2)


def get_priority_level(score):
    """Convert priority score into a priority level."""

    if score >= 80:
        return "CRITICAL"
    elif score >= 60:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"


if __name__ == "__main__":
    score = calculate_priority(
        mission_importance=90,
        urgency=80,
        deadline_pressure=75,
        waiting_time=30
    )

    level = get_priority_level(score)

    print("Priority Score:", score)
    print("Priority Level:", level)