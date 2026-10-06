import { useState } from "react";
import "./App.css";

function App() {
  const [linkFailed, setLinkFailed] = useState(false);

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>🚀 ASTRA-ROUTE</h1>
          <p>Disruption-Tolerant Space Data Routing Engine</p>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <main className="dashboard">

        {/* NETWORK */}
        <section className="card network-card">
          <div className="card-title">
            <h2>Space Network</h2>
            <span>LIVE</span>
          </div>

          <div className="network">

            <div className="node earth">
              🌍
              <strong>EARTH</strong>
            </div>

            {linkFailed ? (
              <>
                <div className="line active"></div>

                <div className="node">
                  🛰️  
                  <strong>RELAY A</strong>
                </div>

                <div className="line active"></div>

                <div className="node">
                  🛰️
                  <strong>RELAY B</strong>
                </div>

                <div className="line active"></div>
              </>
            ) : (
              <>
                <div className="line active"></div>

                <div className="node">
                  🛰️
                  <strong>RELAY C</strong>
                </div>

                <div className="line active"></div>
              </>
            )}

            <div className="node mars">
              🔴
              <strong>MARS</strong>
            </div>

          </div>

          {linkFailed && (
            <div className="alert">
              ⚠LINK EARTH-C FAILED — REROUTING MESSAGE
            </div>  
          )}
        </section>

        {/* MESSAGE QUEUE */}
        <section className="card">
          <div className="card-title">
            <h2>Message Queue</h2>
          </div>

          <div className="message">
            <span className="priority emergency">HIGH</span>

            <div>
              <strong>M001 — Emergency Data</strong>
              <p>Deadline: 20 sec</p>
            </div>

            <span className="message-status">
              {linkFailed ? "REROUTING" : "TRANSMITTING"}
            </span>
          </div>

          <div className="message">
            <span className="priority high">MEDIUM</span>

            <div>
              <strong>M002 — Navigation Data</strong>
              <p>Deadline: 60 sec</p>
            </div>

            <span className="message-status">
              WAITING
            </span>
          </div>

          <div className="message">
            <span className="priority normal">LOW</span>

            <div>
              <strong>M003 — Science Data</strong>
              <p>Deadline: 180 sec</p>
            </div>

            <span className="message-status">
              BUFFERED
            </span>
          </div>
        </section>

        {/* ROUTE */}
        <section className="card route-card">

          <div className="card-title">
            <h2>Selected Route</h2>
          </div>

          <div className="route">

            <span>🌍 Earth</span>
            <span>→</span>

            {linkFailed ? (
             <>
              <span>🛰️ Relay A</span>
              <span>→</span>
              <span>🛰️ Relay B</span>
              <span>→</span>
            </>
          ) : (
            <>
              <span>🛰️ Relay C</span>
              <span>→</span>
            </>
          )}

          <span>🔴 Mars</span>

        </div>

          <div className="metrics">

            <div>
              <small>Route Score</small>
              <strong>0.87</strong>
            </div>

            <div>
              <small>Delay</small>
              <strong>{linkFailed ? "11.4" : "8.2"} sec</strong>
            </div>

            <div>
              <small>Reliability</small>
              <strong>94%</strong>
            </div>

            <div>
              <small>Bandwidth</small>
              <strong>72%</strong>
            </div>

          </div>

        </section>

        {/* CONTROLS */}
        <section className="card controls">

          <h2>Simulation Controls</h2>

          <div className="buttons">

            <button className="primary">
              🚨 Send Emergency Message
            </button>

            <button
              className="danger"
              onClick={() => setLinkFailed(true)}
            >
              ❌ Fail Link Earth-C
            </button>

            <button
              className="success"
              onClick={() => setLinkFailed(false)}
            >
              ✓ Restore Link
            </button>

          </div>

        </section>

        {/* EVENT LOG */}
        <section className="card">

          <div className="card-title">
            <h2>Event Log</h2>
          </div>

          <div className="event">
            <span>10:32:01</span>
            <p>Emergency message received</p>
          </div>

          <div className="event">
            <span>10:32:02</span>
            <p>Priority assigned: HIGH</p>
          </div>

          <div className="event">
            <span>10:32:03</span>
            <p>Optimal route calculated</p>
          </div>

          {linkFailed && (
            <>
              <div className="event warning">
                <span>10:32:08</span>
                <p>⚠ Link Earth-C failure detected</p>
              </div>

              <div className="event">
                <span>10:32:09</span>
                <p>✓ Alternative route selected</p>
              </div>
            </>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;