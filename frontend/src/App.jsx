import { useState } from "react";
import "./App.css";

const INITIAL_EVENTS = [
  "System initialized",
  "Primary route selected",
  "Message transmission active",
];

const NETWORK_LINKS = [
  ["Earth", "Relay C"], ["Relay C", "Mars"],
  ["Earth", "Relay A"], ["Relay A", "Relay B"], ["Relay B", "Mars"],
];

const PRIORITY_DEADLINES = { CRITICAL: 20, HIGH: 60, NORMAL: 180 };

function estimateRouteDelaySeconds(route, source, destination) {
  if (source === "Earth" && destination === "Mars") {
    if (route.join("|") === "Earth|Relay C|Mars") return 8.2;
    if (route.join("|") === "Earth|Relay A|Relay B|Mars") return 11.4;
  }
  if (source === "Mars" && destination === "Earth") {
    if (route.join("|") === "Mars|Relay C|Earth") return 8.2;
    if (route.join("|") === "Mars|Relay B|Relay A|Earth") return 11.4;
  }
  return Math.max(0, route.length - 1) * 5;
}

const INITIAL_MESSAGES = [
  { id: "M001", content: "Emergency Data", source: "Earth", destination: "Mars", priority: "CRITICAL", status: "TRANSMITTING", deadline: "20 sec", deadlineSeconds: 20, deadlineSource: "demo simulation", size: "10 units", sizeSource: "demo simulation", demo: true },
  { id: "M002", content: "Navigation Data", source: "Earth", destination: "Mars", priority: "MEDIUM", status: "QUEUED", deadline: "60 sec", deadlineSeconds: 60, deadlineSource: "demo simulation", size: "15 characters", sizeSource: "computed from demo text", demo: true },
  { id: "M003", content: "Science Data", source: "Earth", destination: "Mars", priority: "LOW", status: "QUEUED", deadline: "180 sec", deadlineSeconds: 180, deadlineSource: "demo simulation", size: "12 characters", sizeSource: "computed from demo text", demo: true },
];

function findRoute(source, destination, linkFailed, networkOutage, deadlineSeconds = Infinity) {
  if (networkOutage) return [];
  if (source === destination) return [source];

  const availableLinks = NETWORK_LINKS.filter(([from, to]) =>
    !linkFailed || !(from === "Earth" && to === "Relay C"),
  );
  const pending = [[source]];
  const visited = new Set([source]);

  while (pending.length) {
    const route = pending.shift();
    const current = route[route.length - 1];

    for (const [from, to] of availableLinks) {
      const next = from === current ? to : to === current ? from : null;
      if (!next || visited.has(next)) continue;
      const nextRoute = [...route, next];
      if (next === destination) {
        return estimateRouteDelaySeconds(nextRoute, source, destination) <= deadlineSeconds ? nextRoute : [];
      }
      visited.add(next);
      pending.push(nextRoute);
    }
  }

  return [];
}

function priorityTone(priority) {
  return priority === "CRITICAL" ? "emergency" : ["HIGH", "MEDIUM"].includes(priority) ? "high" : "normal";
}

function App() {
  const [linkFailed, setLinkFailed] = useState(false);
  const [networkOutage, setNetworkOutage] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeMessageId, setActiveMessageId] = useState("M001");
  const [messageContent, setMessageContent] = useState("");
  const [source, setSource] = useState("Earth");
  const [destination, setDestination] = useState("Mars");
  const [priority, setPriority] = useState("HIGH");
  const [deadlineOverride, setDeadlineOverride] = useState("AUTO");
  const [formError, setFormError] = useState("");

  const state = networkOutage
    ? {
        label: "DISRUPTED / BUFFERING",
        shortLabel: "DISRUPTED",
        tone: "disrupted",
        network: "DISRUPTED",
        mode: "STORE & FORWARD",
        availability: "0%",
        congestion: "HIGH",
        communication: "WAITING",
        route: [],
        messageStatus: "BUFFERED",
        buffered: "1",
        decision: "No viable route. Message stored in buffer until connectivity is restored.",
      }
    : linkFailed
      ? {
          label: "DEGRADED / REROUTING",
          shortLabel: "DEGRADED",
          tone: "degraded",
          network: "DEGRADED",
          mode: "REROUTING",
          availability: "67%",
          congestion: "MEDIUM",
          communication: "ACTIVE",
          route: ["Earth", "Relay A", "Relay B", "Mars"],
          messageStatus: "REROUTING",
          buffered: "0",
          decision: "Earth-C unavailable. ASTRA-ROUTE evaluated available paths and selected an alternative route.",
        }
      : {
          label: "NORMAL",
          shortLabel: "STABLE",
          tone: "normal",
          network: "STABLE",
          mode: "ADAPTIVE",
          availability: "100%",
          congestion: "LOW",
          communication: "ACTIVE",
          route: ["Earth", "Relay C", "Mars"],
          messageStatus: "TRANSMITTING",
          buffered: "0",
          decision: "Primary route selected based on delay, reliability, bandwidth and link availability.",
        };

  const setScenario = (failed, outage, nextEvents) => {
    setLinkFailed(failed);
    setNetworkOutage(outage);
    setMessages((current) => current.map((message) => {
      if (message.status === "DELIVERED" || message.status === "FAILED" || message.status === "QUEUED") return message;
      if (outage) return { ...message, status: "BUFFERED" };
      if (failed) {
        const route = findRoute(message.source, message.destination, true, false, message.deadlineSeconds);
        return { ...message, status: route.length ? "REROUTING" : "BUFFERED" };
      }
      if (!["BUFFERED", "REROUTING"].includes(message.status)) return message;
      const route = findRoute(message.source, message.destination, false, false, message.deadlineSeconds);
      return { ...message, status: route.length ? "TRANSMITTING" : "BUFFERED" };
    }));
    setEvents(nextEvents);
  };

  const failEarthC = () => setScenario(true, false, [
    "Link Earth-C failure detected",
    "Route recalculation initiated",
    "Alternative route selected",
    "Message rerouting",
  ]);

  const restoreLink = () => setScenario(false, false, [
    "Earth-C link restored",
    "Primary route recalculated",
    "Primary route available",
  ]);

  const simulateOutage = () => setScenario(false, true, [
    "Network disruption detected",
    "No viable route",
    "Message buffered",
    "Store-and-forward mode active",
  ]);

  const restoreNetwork = () => setScenario(false, false, [
    "Network connectivity restored",
    "Buffered message released",
    "Primary route available",
  ]);

  const activeMessage = messages.find((message) => message.id === activeMessageId) ?? messages[0];
  const activeRoute = activeMessage
    ? findRoute(activeMessage.source, activeMessage.destination, linkFailed, networkOutage, activeMessage.deadlineSeconds)
    : state.route;
  const missionLink = activeMessage.source === "Earth" && activeMessage.destination === "Mars"
    ? "OUTBOUND"
    : activeMessage.source === "Mars" && activeMessage.destination === "Earth" ? "RETURN" : "NODE-TO-NODE";
  const missionLinkLabel = `${missionLink}: ${activeMessage.source.toUpperCase()} → ${activeMessage.destination.toUpperCase()}`;
  const estimatedDelay = activeRoute.length
    ? estimateRouteDelaySeconds(activeRoute, activeMessage.source, activeMessage.destination)
    : null;
  const recoveryNotice = !linkFailed && !networkOutage && [
    "Primary route available", "Buffered message released", "Primary route recalculated",
  ].includes(events[events.length - 1]);
  const evaluationStatus = activeMessage.status === "DELIVERED"
    ? "DELIVERED"
    : networkOutage || !activeRoute.length
    ? "NO FEASIBLE ROUTE"
    : linkFailed
      ? "REROUTING"
        : recoveryNotice
          ? "ROUTE RE-EVALUATED"
        : "PREFERRED";
  const evaluationTone = evaluationStatus === "NO FEASIBLE ROUTE" ? "disrupted"
    : evaluationStatus === "REROUTING" ? "degraded" : "normal";
  const normalRoute = activeMessage
    ? findRoute(activeMessage.source, activeMessage.destination, false, false, Infinity)
    : [];
  const failureChangedRoute = linkFailed && activeRoute.length > 0 && activeRoute.join("|") !== normalRoute.join("|");
  const decisionExplanation = activeMessage.status === "DELIVERED"
    ? `${activeMessage.id} has completed its simulated transmission to ${activeMessage.destination}.`
    : networkOutage
    ? "No currently available path satisfies the connectivity requirement. The message is buffered until connectivity returns."
    : !activeRoute.length
      ? `${linkFailed ? "The primary Earth–Relay C route is unavailable. " : ""}No available path estimate meets this mission deadline (${activeMessage.deadline}). The message remains buffered.`
      : failureChangedRoute
        ? `The primary ${missionLink === "RETURN" ? "return " : ""}route via Relay C is unavailable. The alternate path was re-evaluated and estimated at ${estimatedDelay} seconds; it ${estimatedDelay <= activeMessage.deadlineSeconds ? "meets" : "does not meet"} the simulated mission deadline.`
        : recoveryNotice
        ? "Connectivity restored. The route was re-evaluated and buffered transmission has resumed."
          : "The available route with the fewest hops is selected. Priority is shown as a mission constraint; it is not a weighted route score in this prototype.";
  const delayIsDegraded = activeRoute.length > normalRoute.length;
  const decisionFactors = [
    {
      name: "Delay",
      result: !activeRoute.length ? "UNAVAILABLE" : delayIsDegraded ? "DEGRADED" : "FAVORABLE",
      detail: estimatedDelay === null ? "No feasible path estimate" : `~${estimatedDelay} sec · illustrative route estimate`,
    },
    { name: "Reliability", result: "NOT SCORED", detail: "Per-link reliability is not supplied to the frontend route finder." },
    { name: "Bandwidth", result: "NOT SCORED", detail: "Per-link bandwidth is not supplied to the frontend route finder." },
    {
      name: "Link availability",
      result: networkOutage ? "UNAVAILABLE" : linkFailed ? "DEGRADED" : "FAVORABLE",
      detail: networkOutage ? "No links currently available" : linkFailed ? "Earth–Relay C failed; alternate path checked" : "Required links available",
    },
    {
      name: "Congestion",
      result: state.congestion,
      detail: "Illustrative scenario context; not scored by this path finder.",
    },
    {
      name: "Mission priority",
      result: activeMessage.priority,
      detail: "Shown as a mission constraint; not a weighted route score.",
    },
    {
      name: "Deadline feasibility",
      result: !activeRoute.length ? "UNAVAILABLE" : estimatedDelay <= activeMessage.deadlineSeconds ? "FAVORABLE" : "DEGRADED",
      detail: !activeRoute.length ? "No route meets this deadline" : `${estimatedDelay} sec estimate vs ${activeMessage.deadline} · ${activeMessage.deadlineSource}`,
    },
  ];
  const decisionLead = activeMessage.status === "DELIVERED"
    ? "MESSAGE DELIVERED"
    : networkOutage
    ? "NO FEASIBLE ROUTE · MISSION MESSAGE BUFFERED"
      : !activeRoute.length
        ? "NO FEASIBLE ROUTE FOR THIS MISSION"
      : failureChangedRoute
        ? "PRIMARY ROUTE UNAVAILABLE · ALTERNATIVE ROUTE SELECTED"
        : recoveryNotice
          ? "CONNECTIVITY RESTORED · ROUTE RE-EVALUATED"
          : activeMessage.status === "DELIVERED" ? "MESSAGE DELIVERED" : "ROUTE SELECTED";
  const transmissionActive = activeMessage && ["TRANSMITTING", "REROUTING"].includes(activeMessage.status);
  const routeIsActive = (from, to) =>
    activeRoute.some((node, index) => (node === from && activeRoute[index + 1] === to)
      || (node === to && activeRoute[index + 1] === from));

  const nodePositions = {
    Earth: [83, 160], "Relay A": [310, 260], "Relay B": [570, 260],
    "Relay C": [310, 60], Mars: [817, 160],
  };
  const nodes = Object.entries(nodePositions);
  const links = NETWORK_LINKS;
  const linkFailedFor = (from, to) => linkFailed && from === "Earth" && to === "Relay C";

  const transmitMessage = (event) => {
    event.preventDefault();
    const content = messageContent.trim();
    if (!content) {
      setFormError("Enter mission message content before transmitting.");
      return;
    }
    if (source === destination) {
      setFormError("Choose different source and destination nodes.");
      return;
    }

    const nextNumber = Math.max(...messages.map((message) => Number(message.id.slice(1)))) + 1;
    const id = `M${String(nextNumber).padStart(3, "0")}`;
    const deadlineSeconds = deadlineOverride === "AUTO" ? PRIORITY_DEADLINES[priority] : Number(deadlineOverride);
    const deadlineSource = deadlineOverride === "AUTO" ? "priority-based simulation" : "user supplied";
    const route = findRoute(source, destination, linkFailed, networkOutage, deadlineSeconds);
    const normalRoute = findRoute(source, destination, false, false, deadlineSeconds);
    const status = !route.length
      ? "BUFFERED"
      : linkFailed && route.join("|") !== normalRoute.join("|")
        ? "REROUTING"
        : "TRANSMITTING";
    const newMessage = {
      id, content, source, destination, priority, status, demo: false,
      size: `${new Blob([content]).size} bytes`,
      sizeSource: "computed from message content",
      deadline: `${deadlineSeconds} sec`, deadlineSeconds, deadlineSource,
    };

    setMessages((current) => [...current, newMessage]);
    setActiveMessageId(id);
    setEvents((current) => [
      ...current,
      `${id} mission message created (${priority})`,
      route.length ? `${id} route selected: ${route.join(" → ")}` : `${id} buffered: no available route`,
      route.length ? `${id} transmission started` : `${id} waiting for network restoration`,
    ]);
    setMessageContent("");
    setFormError("");
  };

  const markDelivered = () => {
    if (!activeMessage || !activeRoute.length || networkOutage) return;
    setMessages((current) => current.map((message) =>
      message.id === activeMessage.id ? { ...message, status: "DELIVERED" } : message,
    ));
    setEvents((current) => [...current, `${activeMessage.id} delivered to ${activeMessage.destination}`]);
  };

  const selectMessage = (message) => {
    setActiveMessageId(message.id);
    if (message.status !== "QUEUED") return;

    const route = findRoute(message.source, message.destination, linkFailed, networkOutage, message.deadlineSeconds);
    const normalRoute = findRoute(message.source, message.destination, false, false, message.deadlineSeconds);
    const status = !route.length
      ? "BUFFERED"
      : linkFailed && route.join("|") !== normalRoute.join("|")
        ? "REROUTING"
        : "TRANSMITTING";
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, status } : item));
    setEvents((current) => [...current, route.length ? `${message.id} transmission started` : `${message.id} buffered: no available route`]);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="eyebrow">MISSION CONTROL · ROUTING SYSTEM</span>
          <h1>ASTRA-ROUTE</h1>
          <p>Adaptive Mission-Aware Space Routing System</p>
        </div>
        <div className="header-status">
          <span className={`system-status ${state.tone}`}>
            <i className="status-dot" /> SYSTEM ONLINE
          </span>
          <span className={`state-badge ${state.tone}`}>{state.label}</span>
        </div>
      </header>

      <main className="dashboard">
        <section className={`card network-card ${state.tone}`}>
          <div className="card-title">
            <div><span className="eyebrow">COMMUNICATION TOPOLOGY</span><h2>Space Network</h2></div>
            <span className={`state-badge ${state.tone}`}>{state.shortLabel}</span>
          </div>
          <div className={`network ${networkOutage ? "network-outage" : ""}`}>
            <img className="space-illustration" src="/images/space-backdrop.svg" alt="" aria-hidden="true" />
            <svg className="network-map" viewBox="0 0 900 320" role="img" aria-label="Space network topology showing Earth, two relay paths, and Mars">
              {links.map(([from, to]) => {
                const [x1, y1] = nodePositions[from];
                const [x2, y2] = nodePositions[to];
                const failed = linkFailedFor(from, to);
                const active = transmissionActive && !networkOutage && routeIsActive(from, to);
                const routeIndex = activeRoute.findIndex((node, index) =>
                  (node === from && activeRoute[index + 1] === to) || (node === to && activeRoute[index + 1] === from));
                const forward = routeIndex < 0 || activeRoute[routeIndex] === from;
                const path = active && !forward ? `M ${x2} ${y2} L ${x1} ${y1}` : `M ${x1} ${y1} L ${x2} ${y2}`;
                return <g key={`${from}-${to}`}><path d={path} className={`line ${active ? "active" : "inactive"} ${failed ? "failed" : ""}`} />{active && <circle r="5" className="packet"><animateMotion dur="3s" repeatCount="indefinite" path={path} /></circle>}{failed && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 12} className="failed-link-label">FAILED</text>}</g>;
              })}
              {nodes.map(([node, [x, y]]) => {
                const relayCFailed = node === "Relay C" && linkFailed;
                const active = activeRoute.includes(node) && !networkOutage;
                return <g key={node} className={`map-node ${active ? "on-route" : ""} ${relayCFailed || networkOutage ? "offline" : ""}`} transform={`translate(${x} ${y})`}>
                  <circle r="29" className="node-halo" /><circle r="22" className="node-core" />
                  <text y="4" className="node-symbol">{node === "Earth" ? "⊕" : node === "Mars" ? "◉" : "◇"}</text>
                  <text y="51" className="node-label">{node.toUpperCase()}</text>
                  {relayCFailed && <text y="68" className="node-state">FAILED / OFFLINE</text>}
                  {networkOutage && <text y="68" className="node-state">NO SIGNAL</text>}
                </g>;
              })}
            </svg>
          </div>
          <div className={`network-caption ${state.tone}`}>
            <span className="caption-mark">{networkOutage ? "Ⅱ" : linkFailed ? "↪" : "●"}</span>
            {networkOutage ? "NO AVAILABLE ROUTE · MESSAGE HELD IN BUFFER" : !activeRoute.length ? `NO AVAILABLE PATH · ${activeMessage.id} BUFFERED` : linkFailed ? `EARTH-C LINK FAILED · ROUTE ${activeRoute.join(" → ")}` : `SELECTED PATH · ${activeRoute.join(" → ")}`}
          </div>
        </section>

        <section className="card composer-card">
          <div className="card-title">
            <div><span className="eyebrow">MISSION MESSAGE COMPOSER</span><h2>Send Mission Message</h2></div>
            <span className="tag">LOCAL SIMULATION</span>
          </div>
          <form className="message-form" onSubmit={transmitMessage}>
            <label className="form-field message-content-field">
              <span>MESSAGE CONTENT</span>
              <textarea
                id="message-content"
                value={messageContent}
                onChange={(event) => { setMessageContent(event.target.value); setFormError(""); }}
                placeholder="Enter mission payload or instruction…"
                maxLength={500}
                required
                rows={3}
              />
              <small>{messageContent.length}/500 characters</small>
            </label>
            <label className="form-field">
              <span>SOURCE</span>
              <select value={source} onChange={(event) => {
                const nextSource = event.target.value;
                setSource(nextSource);
                if (nextSource === destination) setDestination(source);
                setFormError("");
              }}>
                {["Earth", "Mars", "Relay A", "Relay B", "Relay C"].map((node) => <option key={node}>{node}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>DESTINATION</span>
              <select value={destination} onChange={(event) => {
                const nextDestination = event.target.value;
                setDestination(nextDestination);
                if (nextDestination === source) setSource(destination);
                setFormError("");
              }}>
                {["Earth", "Mars", "Relay A", "Relay B", "Relay C"].map((node) => <option key={node}>{node}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>PRIORITY</span>
              <select value={priority} onChange={(event) => { setPriority(event.target.value); setFormError(""); }}>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
              </select>
            </label>
            <label className="form-field">
              <span>MISSION DEADLINE</span>
              <select value={deadlineOverride} onChange={(event) => { setDeadlineOverride(event.target.value); setFormError(""); }}>
                <option value="AUTO">Auto by priority</option>
                <option value="10">10 seconds</option>
                <option value="20">20 seconds</option>
                <option value="60">60 seconds</option>
                <option value="180">180 seconds</option>
              </select>
            </label>
            <div className="form-submit">
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="transmit-button" type="submit">🚀 TRANSMIT MESSAGE</button>
            </div>
          </form>
        </section>

        <section className="card mission-overview">
          <div className="card-title"><div><span className="eyebrow">PROTOTYPE SIMULATION</span><h2>Mission Data Overview</h2></div><span className="tag">DEMO</span></div>
          <div className="mission-stats">
            <div className="mission-stat"><small>CRITICAL DATA</small><strong>{messages.filter((message) => message.priority === "CRITICAL").length}</strong><p>Emergency messages</p></div>
            <div className="mission-stat"><small>ACTIVE MESSAGES</small><strong>{messages.length}</strong><p>Mission queue</p></div>
            <div className="mission-stat"><small>BUFFERED</small><strong className={messages.some((message) => message.status === "BUFFERED") ? "alert-value" : ""}>{messages.filter((message) => message.status === "BUFFERED").length}</strong><p>Awaiting connectivity</p></div>
            <div className="mission-stat"><small>NETWORK MODE</small><strong className="mode-value">{networkOutage ? "BUFFER" : linkFailed ? "REROUTE" : "NORMAL"}</strong><p>Adaptive routing</p></div>
          </div>
        </section>

        <section className="card queue-card">
          <div className="card-title"><div><span className="eyebrow">PRIORITY-AWARE DELIVERY</span><h2>Transmission Queue</h2></div><span className="tag">{String(messages.length).padStart(2, "0")} MESSAGES</span></div>
          <div className="message-list">
            {messages.map((message) => (
              <button
                type="button"
                className={`transmission-row ${message.id === activeMessageId ? "selected" : ""} ${message.priority === "CRITICAL" ? "critical-message" : ""}`}
                key={message.id}
                onClick={() => selectMessage(message)}
                aria-pressed={message.id === activeMessageId}
              >
                <span className={`priority ${priorityTone(message.priority)}`}>{message.priority}</span>
                <span className="transmission-main">
                  <span className="message-heading"><strong>{message.id}</strong><span>{message.content}</span></span>
                  <span className="message-meta"><span>{message.source} → {message.destination}</span><span>Size {message.size}</span>{message.deadline && <span>Due {message.deadline}</span>}</span>
                </span>
                <span className={`message-status ${message.status.toLowerCase()}`}>{message.status}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card conditions-card">
          <div className="card-title"><div><span className="eyebrow">LIVE SIMULATION STATE</span><h2>Network Conditions</h2></div><span className={`state-badge ${state.tone}`}>{state.network}</span></div>
          <div className="condition-grid">
            <div className="condition"><small>LINK AVAILABILITY</small><strong>{state.availability}</strong></div>
            <div className="condition"><small>CONGESTION</small><strong>{state.congestion}</strong></div>
            <div className="condition"><small>ROUTING MODE</small><strong>{state.mode}</strong></div>
            <div className="condition"><small>COMMUNICATION</small><strong>{state.communication}</strong></div>
          </div>
          <p className="prototype-note">Illustrative prototype values · not live telemetry</p>
        </section>

        <section className="card route-card">
          <div className="card-title"><div><span className="eyebrow">MISSION-AWARE ADAPTIVE ROUTING</span><h2>Selected Route</h2></div><span className={`state-badge ${evaluationTone}`}>{evaluationStatus}</span></div>
          <div className="active-message-summary">
            <div className="mission-link-indicator"><span>MISSION LINK</span><strong>{missionLinkLabel}{failureChangedRoute ? ` · PRIMARY ${missionLink === "RETURN" ? "RETURN " : ""}ROUTE FAILED` : ""}</strong></div>
            <div className="profile-heading">
              <div><span className="eyebrow">MISSION PROFILE</span><strong>{activeMessage.id}</strong></div>
              <span className={`priority ${priorityTone(activeMessage.priority)}`}>{activeMessage.priority}</span>
              <span className={`message-status ${activeMessage.status.toLowerCase()}`}>{activeMessage.status}</span>
            </div>
            <div className="mission-profile-grid">
              <div><small>SOURCE</small><strong>{activeMessage.source}</strong></div>
              <div><small>DESTINATION</small><strong>{activeMessage.destination}</strong></div>
              <div><small>PAYLOAD SIZE</small><strong>{activeMessage.size}</strong><em>{activeMessage.sizeSource}</em></div>
              <div><small>MISSION DEADLINE</small><strong>{activeMessage.deadline}</strong><em>{activeMessage.deadlineSource}</em></div>
            </div>
            <p className="active-message-content">{activeMessage.content}</p>
            {["TRANSMITTING", "REROUTING"].includes(activeMessage.status) && activeRoute.length > 0 && !networkOutage && (
              <button className="complete-button" type="button" onClick={markDelivered}>COMPLETE DELIVERY · SIMULATION</button>
            )}
          </div>
          {!activeRoute.length ? (
            <div className="no-route"><span>⊘</span><div><strong>No viable route for {activeMessage.source} → {activeMessage.destination}</strong><p>{activeMessage.id} is buffered until a route becomes available.</p></div></div>
          ) : (
            <div className="route" aria-label={`Selected route: ${activeRoute.join(" to ")}`}>
              {activeRoute.map((node, index) => <span className="route-step" key={node}><span className="route-node">{node}</span>{index < activeRoute.length - 1 && <span className="route-arrow">→</span>}</span>)}
            </div>
          )}
          <div className={`decision-panel ${evaluationTone}`}>
            <div className="decision-title"><strong>WHY THIS ROUTE?</strong><span className={`evaluation-status ${evaluationStatus.toLowerCase().replaceAll(" ", "-")}`}>{evaluationStatus}</span></div>
            <p className="decision-lead">{decisionLead}</p>
            <p>{decisionExplanation}</p>
            <div className="factor-heading"><span className="eyebrow">DECISION FACTORS</span><span>Qualitative · frontend simulation</span></div>
            <div className="decision-factor-grid">
              {decisionFactors.map((factor) => {
                const tone = factor.name === "Mission priority" ? priorityTone(activeMessage.priority)
                  : factor.result === "FAVORABLE" || factor.result === "LOW" ? "favorable"
                  : ["DEGRADED", "MEDIUM", "HIGH"].includes(factor.result) ? "degraded"
                    : factor.result === "UNAVAILABLE" ? "unavailable"
                      : factor.result === "NOT SCORED" ? "unscored" : "constraint";
                const icon = tone === "favorable" ? "✓" : tone === "degraded" ? "!" : tone === "unavailable" ? "×" : tone === "unscored" ? "—" : "◆";
                return <div className="decision-factor" key={factor.name}>
                  <strong>{factor.name}</strong>
                  <span className={`factor-result ${tone}`}><b>{icon}</b>{factor.result}</span>
                  <small>{factor.detail}</small>
                </div>;
              })}
            </div>
            <p className="decision-caveat">Route choice uses link availability, hop count and deadline feasibility. Delay uses existing Earth–Mars demo estimates and an illustrative 5 sec/hop for other paths. Priority is a visible mission constraint; reliability and bandwidth are not scored because this frontend has no per-link values.</p>
          </div>
        </section>

        <section className="card controls-card">
          <div className="card-title"><div><span className="eyebrow">SCENARIO CONTROLS</span><h2>Simulation Controls</h2></div></div>
          <div className="buttons">
            <button className="primary" onClick={() => { setMessageContent("Emergency data from Earth to Mars"); setSource("Earth"); setDestination("Mars"); setPriority("CRITICAL"); setDeadlineOverride("AUTO"); setFormError(""); setEvents((current) => [...current, "Emergency message template loaded into composer"]); }}>＋ Load Emergency Template</button>
            <button className="danger" onClick={failEarthC} disabled={networkOutage || linkFailed}>⊗ Fail Link Earth-C</button>
            <button className="success" onClick={restoreLink} disabled={!linkFailed}>↻ Restore Link</button>
            <button className="danger" onClick={simulateOutage} disabled={networkOutage}>⚠ Simulate Network Outage</button>
            <button className="success" onClick={restoreNetwork} disabled={!networkOutage && !linkFailed}>↻ Restore Network</button>
          </div>
        </section>

        <section className="card event-card">
          <div className="card-title"><div><span className="eyebrow">SIMULATION TRACE</span><h2>Event Log</h2></div><span className="tag">{events.length.toString().padStart(2, "0")} EVENTS</span></div>
          <div className="event-list" aria-live="polite">
            {events.map((event, index) => <div className={`event ${/fail|disruption|no viable|buffer/i.test(event) ? "warning" : ""}`} key={`${event}-${index}`}><span className="event-index">{String(index + 1).padStart(2, "0")}</span><span className="event-mark" /><p>{event}</p></div>)}
          </div>
        </section>
      </main>
      <footer className="footer"><span>ASTRA-ROUTE · DISRUPTION-TOLERANT SPACE COMMUNICATION</span><span>SIMULATION MODE</span></footer>
    </div>
  );
}

export default App;
