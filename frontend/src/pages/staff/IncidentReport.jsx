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

  .incident-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .incident-body {
    padding: 40px 48px;
  }

  .incident-header {
    margin-bottom: 30px;
  }

  .incident-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 5px;
  }

  .incident-subtitle {
    color: #8a7a65;
    font-size: 14px;
  }

  .incident-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 22px;
  }

  .incident-card {
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

  .input {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #e0d3bf;
    background: white;
    margin-bottom: 14px;
    font-size: 13px;
    outline: none;
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

  .textarea:focus,
  .input:focus {
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
    transition: 0.15s;
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

  .incident-item {
    padding: 18px 0;
    border-bottom: 1px solid #f0e6d8;
  }

  .incident-item:last-child {
    border-bottom: none;
  }

  .incident-camper {
    font-size: 13px;
    color: #8a7a65;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .incident-desc {
    font-size: 14px;
    color: #2c1810;
    line-height: 1.6;
  }

  .empty {
    color: #8a7a65;
    font-size: 13px;
  }

  @media(max-width: 950px) {
    .incident-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function IncidentReport() {

  const [campers, setCampers] = useState([]);

  const [camperId, setCamperId] = useState("");

  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");

  const [reports, setReports] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [editText, setEditText] = useState("");

  useEffect(() => {

    fetchCampers();
    fetchReports();

  }, []);

  const fetchCampers = async () => {

    try {

      const res = await api.get("/staff/campers");

      const data = res.data;

      if (data.success) {
        setCampers(data.data);
      }

    } catch {

      console.log("Campers fetch error");

    }
  };

  const fetchReports = async () => {

    try {

      const res = await api.get("/staff/incidents");

      const data = res.data;

      if (data.success) {
        setReports(data.data);
      }

    } catch {

      console.log("Incident fetch error");

    }
  };

  const submitIncident = async () => {

    if (!camperId || !description) {

      setMessage("Please fill all fields");

      return;
    }

    try {

      const res = await api.post("/staff/incidents", {
        camper_id: camperId,
        description
      });

      const data = res.data;

      setMessage(data.message);

      setCamperId("");
      setDescription("");

      fetchReports();

    } catch {

      setMessage("Error submitting report");

    }
  };

  const deleteIncident = async (id) => {

    try {

      await api.delete(`/staff/incidents/${id}`);

      fetchReports();

    } catch {

      console.log("Delete error");

    }
  };

  const startEdit = (report) => {

    setEditingId(report.id);

    setEditText(report.description);
  };

  const saveEdit = async (id) => {

    try {

      await api.put(`/staff/incidents/${id}`, {
        description: editText
      });

      setEditingId(null);

      fetchReports();

    } catch {

      console.log("Update error");

    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="incident-root">

        <Navbar />

        <div className="incident-body">

          <div className="incident-header">

            <div className="incident-title">
              Incident Reports
            </div>

            <div className="incident-subtitle">
              Report and monitor camp incidents professionally.
            </div>

          </div>

          <div className="incident-grid">

            <div className="incident-card">

              <div className="section-title">
                Submit Incident
              </div>

              <select
                className="input"
                value={camperId}
                onChange={(e) =>
                  setCamperId(e.target.value)
                }
              >

                <option value="">
                  Select Camper
                </option>

                {campers.map((c) => (

                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.full_name}
                  </option>

                ))}

              </select>

              <textarea
                className="textarea"
                placeholder="Describe incident..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <button
                className="btn"
                onClick={submitIncident}
              >
                Submit Report
              </button>

              <div className="message">
                {message}
              </div>

            </div>

            <div className="incident-card">

              <div className="section-title">
                Previous Reports
              </div>

              {reports.length === 0 ? (

                <div className="empty">
                  No reports submitted yet.
                </div>

              ) : (

                reports.map((report, i) => (

                  <div
                    key={i}
                    className="incident-item"
                  >

                    <div className="incident-camper">
                      {report.camper_name}
                    </div>

                    {editingId === report.id ? (

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
                            saveEdit(report.id)
                          }
                        >
                          Save
                        </button>
                      </>

                    ) : (

                      <>
                        <div className="incident-desc">
                          {report.description}
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
                              startEdit(report)
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
                              deleteIncident(report.id)
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

export default IncidentReport;