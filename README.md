
# ASTRA-ROUTE

## Mission-Aware Adaptive Routing for Disrupted Space Communication

ASTRA-ROUTE is a mission-aware, explainable adaptive routing simulator designed to demonstrate disruption-tolerant communication between distant space nodes.

The prototype simulates communication between Earth, Mars, and relay nodes while adapting to network disruptions such as link failures, congestion, and temporary loss of available routes.

## Problem

Space communication networks can experience long delays, unreliable links, intermittent connectivity, and changing network conditions. A communication system therefore needs to adapt when the preferred route becomes unavailable.

## Solution

ASTRA-ROUTE evaluates available routes and adapts message transmission when network conditions change.

The system demonstrates:

- Adaptive route selection
- Link failure detection
- Automatic rerouting
- Store-and-forward message buffering
- Recovery after network restoration
- Message priority and deadlines
- Data integrity verification
- Duplicate message suppression
- Bidirectional Earth-Mars communication
- Explainable mission-aware route decisions

## How It Works

A message is created with mission requirements such as:

- Source
- Destination
- Priority
- Deadline
- Payload

The system evaluates the available network path and selects a suitable route.

For example:

Earth → Relay C → Mars

If the Earth–Relay C link fails, the system can adapt:

Earth → Relay A → Relay B → Mars

The message can therefore continue toward its destination without relying on the failed primary route.

## Key Features

### Adaptive Routing
Routes are recalculated when network conditions change.

### Disruption Handling
The simulator can model link failures, congestion, and network outages.

### Store-and-Forward
Messages can be buffered when no suitable route is temporarily available and transmitted after connectivity is restored.

### Mission-Aware Decision Making
Route decisions consider mission requirements such as priority and deadline along with network conditions.

### Explainable Decisions
The prototype provides a clear explanation of why a route was selected or why rerouting/buffering occurred.

### Data Integrity
Messages can be verified using SHA-256 hashing to detect data changes.

### Bidirectional Communication
The prototype supports both:

Earth → Mars

and

Mars → Earth

## Technology Stack

- Python
- NetworkX
- React
- Vite
- JavaScript
- Git & GitHub

## Project Structure

```text
astra-route/
│
├── backend/
│   └── routing.py
│
├── frontend/
│   ├── public/
│   └── src/
│
├── network.py
├── messages.py
├── simulation.py
├── network_adapter.py
├── integrity.py
├── demo.py
├── integration_test.py
├── failure_integration_test.py
└── README.md
