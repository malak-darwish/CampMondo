import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import api from "../../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .activity-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .activity-body {
    padding: 40px 48px;
  }

  .activity-header {
    margin-bottom: 30px;
  }

  .activity-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 5px;
  }

  .activity-subtitle {
    color: #8a7a65;
    font-size: 14px;
  }

  .activity-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 22px;
  }

  .activity-card {
    background: #fff9f0;
    border-radius: 16px;
    border: 1px solid #e8d5b5;
    padding: 24px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 18px;
  }

  .textarea {
    width: 100%;
    min-height: 120px;
    border-radius: 12px;
    border: 1px solid #e0d3bf;
    padding: 14px;
    resize: none;
    outline: none;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    margin-bottom: 15px;
  }

  .textarea:focus {
    border-color: #3d6b45;
  }

  .btn {
    border: none;
    border-radius: 10px;
    padding: 10px 16px;
    background: #c62828;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn:hover {
    background: #d84343;
  }

  .message {
    margin-top: 15px;
    color: #3d6b45;
    font-size: 13px;
    font-weight: 500;
  }

  .log-item {
    padding: 16px 0;
    border-bottom: 1px solid #f0e6d8;
  }

  .log-item:last-child {
    border-bottom: none;
  }

  .log-title {
    font-size: 14px;
    color: #2c1810;
    line-height: 1.6;
  }

  .empty {
    color: #8a7a65;
    font-size: 13px;
  }

  @media(max-width: 950px) {
    .activity-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function ActivityLog() {

  const [logs, setLogs] = useState([]);

  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {

    try {

      const res = await api.get("/staff/activity-log");

      const data = res.data;

      setLogs(data.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  const addLog = async () => {

    if (!description) {

      setMessage("Please enter activity");

      return;
    }

    try {

      const res = await api.post("/staff/activity-log", {
        description
      });

      const data = res.data;

      setMessage(data.message);

      setDescription("");

      fetchLogs();

    } catch {

      setMessage("Error adding activity");

    }
  };

  const deleteLog = async (id) => {

    try {

      await api.delete(`/staff/activity-log/${id}`);

      fetchLogs();

    } catch {

      console.log("Delete error");

    }
  };

  const startEdit = (log) => {

    setEditingId(log.id);

    setEditText(log.description);
  };

  const saveEdit = async (id) => {

    try {

      await api.put(`/staff/activity-log/${id}`, {
        description: editText
      });

      setEditingId(null);

      fetchLogs();

    } catch {

      console.log("Update error");

    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="activity-root">

        <Navbar />

        <div className="activity-body">

          <div className="activity-header">

            <div className="activity-title">
              Activity Logs
            </div>

            <div className="activity-subtitle">
              Record and review daily camp activities.
            </div>

          </div>

          <div className="activity-grid">

            <div className="activity-card">

              <div className="section-title">
                Add Activity
              </div>

              <textarea
                className="textarea"
                placeholder="Write activity details..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <button
                className="btn"
                onClick={addLog}
              >
                Add Activity
              </button>

              <div className="message">
                {message}
              </div>

            </div>

            <div className="activity-card">

              <div className="section-title">
                Recent Activity Logs
              </div>

              {logs.length === 0 ? (

                <div className="empty">
                  No activity logs yet.
                </div>

              ) : (

                logs.map((log, i) => (

                  <div
                    key={i}
                    className="log-item"
                  >

                    {editingId === log.id ? (

                      <>
                        <textarea
                          className="textarea"
                          value={editText}
                          onChange={(e) =>
                            setEditText(e.target.value)
                          }
                        />

                        <button
                          className="btn"
                          onClick={() =>
                            saveEdit(log.id)
                          }
                        >
                          Save
                        </button>
                      </>

                    ) : (

                      <>
                        <div className="log-title">
                          {log.description}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "12px"
                          }}
                        >

                          <button
                            className="btn"
                            onClick={() =>
                              startEdit(log)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn"
                            style={{
                              background: "#444"
                            }}
                            onClick={() =>
                              deleteLog(log.id)
                            }
                          >
                            Delete
                          </button>

                        </div>
                      </>
                    )}

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default ActivityLog;