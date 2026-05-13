import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
<<<<<<< HEAD
import { useAuth } from "../../context/AuthContext";

function Attendance() {
  const { logout } = useAuth();
=======

import Navbar from "../../components/Navbar";
import api from "../../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .attendance-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .attendance-body {
    padding: 40px 48px;
  }

  .attendance-header {
    margin-bottom: 30px;
  }

  .attendance-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 5px;
  }

  .attendance-subtitle {
    color: #8a7a65;
    font-size: 14px;
  }

  .attendance-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 22px;
  }

  .attendance-right {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .attendance-card {
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

  .input:focus {
    border-color: #3d6b45;
  }

  .medical-box {
    margin-bottom: 14px;
    padding: 12px;
    border-radius: 10px;
    background: #fff4e5;
    border: 1px solid #f0d3a1;
    font-size: 13px;
    color: #7a4b00;
  }

  .btn-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn {
    border: none;
    border-radius: 10px;
    padding: 11px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.15s;
  }

  .btn-green {
    background: #2c4a2e;
    color: white;
  }

  .btn-green:hover {
    background: #3d6b45;
  }

  .btn-red {
    background: #c62828;
    color: white;
  }

  .btn-red:hover {
    background: #d84343;
  }

  .btn-blue {
    background: #e8a838;
    color: #2c1810;
  }

  .btn-blue:hover {
    opacity: 0.9;
  }

  .message {
    margin-top: 15px;
    font-size: 13px;
    color: #3d6b45;
    font-weight: 500;
  }

  .attendance-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
  }

  .attendance-table th {
    background: #f8f2e8;
    color: #6e5d48;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 14px;
    text-align: left;
  }

  .attendance-table td {
    padding: 15px 14px;
    border-top: 1px solid #f0e6d8;
    font-size: 13px;
    color: #2c1810;
  }

  .attendance-table tr:hover {
    background: #fffdf9;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }

  .present {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .checkedout {
    background: #fdecea;
    color: #c62828;
  }

  .loading {
    padding: 40px;
    text-align: center;
    color: #8a7a65;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 18px;
  }

  .search-input,
  .filter-select {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #d8c7aa;
    background: white;
    font-size: 14px;
    outline: none;
  }

  .search-input {
    flex: 1;
  }

  .search-input:focus,
  .filter-select:focus {
    border-color: #3d6b45;
  }

  @media(max-width: 950px) {

    .attendance-grid {
      grid-template-columns: 1fr;
    }

    .filter-bar {
      flex-direction: column;
    }
  }
`;

function Attendance() {
>>>>>>> 936b760 (Merge staff dashboard with parent portal project)

  const [camperId, setCamperId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [message, setMessage] = useState("");
<<<<<<< HEAD
  const [records, setRecords] = useState([]);
  const [campers, setCampers] = useState([]);
  const [loading, setLoading] = useState(false);

  // LOAD DATA
  useEffect(() => {
    fetchAttendance();
    fetchCampers();
  }, []);

  // AUTO CLEAR MESSAGE
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // FETCH ATTENDANCE
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:5000/api/staff/attendance");
      const data = await res.json();

      setRecords(data.data || []); // ✅ SAFE FIX

    } catch {
      setMessage("Error loading attendance");
    } finally {
      setLoading(false);
    }
  };

  // FETCH CAMPERS (SAFE)
  const fetchCampers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/staff/campers");

      if (!res.ok) return; // prevents crash

      const data = await res.json();
      setCampers(data.data || []);

    } catch {
      console.log("Campers API not ready");
    }
  };

  // CHECK IN
  const checkIn = async () => {
    if (!camperId || !groupId) {
      setMessage("Fill all fields");
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/api/staff/checkin", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        camper_id: parseInt(camperId),
        group_id: parseInt(groupId)
      })
    });

    const data = await res.json();
=======

  const [records, setRecords] = useState([]);
  const [campers, setCampers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [insideCamp, setInsideCamp] = useState([]);

  const [selectedCamper, setSelectedCamper] = useState(null);

  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {

    fetchAttendance();
    fetchCampers();
    fetchGroups();
    fetchCurrentlyInside();

  }, []);

  useEffect(() => {

    if (message) {

      const t = setTimeout(() => setMessage(""), 3000);

      return () => clearTimeout(t);

    }

  }, [message]);

  const fetchAttendance = async () => {

    try {

      setLoading(true);

      const res = await api.get("/staff/attendance");

      const data = res.data;

      setRecords(data.data || []);

    } catch {

      setMessage("Error loading attendance");

    } finally {

      setLoading(false);

    }
  };

  const fetchCampers = async () => {

    try {

      const res = await api.get("/staff/campers");

      const data = res.data;

      setCampers(data.data || []);

    } catch {

      console.log("Campers API not ready");

    }
  };

  const fetchGroups = async () => {

    try {

      const res = await api.get("/staff/groups");

      const data = res.data;

      setGroups(data.data || []);

    } catch {

      console.log("Groups API not ready");

    }
  };

  const fetchCurrentlyInside = async () => {

    try {

      const res = await api.get("/staff/currently-inside");

      const data = res.data;

      setInsideCamp(data.data || []);

    } catch {

      console.log("Currently inside API not ready");

    }
  };

  const checkIn = async () => {

    if (!camperId || !groupId) {

      setMessage("Please fill all fields");

      return;
    }

    const res = await api.post("/staff/checkin", {
      camper_id: parseInt(camperId),
      group_id: parseInt(groupId)
    });

    const data = res.data;

>>>>>>> 936b760 (Merge staff dashboard with parent portal project)
    setMessage(data.message);

    setCamperId("");
    setGroupId("");
<<<<<<< HEAD

    fetchAttendance();
  };

  // CHECK OUT
  const checkOut = async () => {
    if (!camperId) {
      setMessage("Select Camper");
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/api/staff/checkout", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        camper_id: parseInt(camperId)
      })
    });

    const data = await res.json();
    setMessage(data.message);

    setCamperId("");

    fetchAttendance();
  };

  // EXPORT EXCEL
  const exportToExcel = () => {
    if (!records.length) {
      setMessage("⚠️ No data to export");
=======
    setSelectedCamper(null);

    fetchAttendance();
    fetchCurrentlyInside();
  };

  const checkOut = async () => {

    if (!camperId) {

      setMessage("Select camper");

      return;
    }

    const res = await api.post("/staff/checkout", {
      camper_id: parseInt(camperId)
    });

    const data = res.data;

    setMessage(data.message);

    setCamperId("");
    setSelectedCamper(null);

    fetchAttendance();
    fetchCurrentlyInside();
  };

  const exportToExcel = () => {

    if (!records.length) {

      setMessage("No attendance data");

>>>>>>> 936b760 (Merge staff dashboard with parent portal project)
      return;
    }

    const formatted = records.map(r => ({
      CamperID: r.camper_id,
<<<<<<< HEAD
      GroupID: r.group_id,
      Date: r.date,
      CheckIn: new Date(r.check_in_time).toLocaleString(),
      CheckOut: r.check_out_time
        ? new Date(r.check_out_time).toLocaleString()
        : "—"
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
=======
      CamperName: r.camper_name,
      Group: r.group_name,
      Date: r.date,
      Status: r.check_out_time
        ? "Checked Out"
        : "Present"
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Attendance"
    );
>>>>>>> 936b760 (Merge staff dashboard with parent portal project)

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array"
    });

<<<<<<< HEAD
    const file = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
=======
    const file = new Blob(
      [buffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    );
>>>>>>> 936b760 (Merge staff dashboard with parent portal project)

    saveAs(file, "attendance.xlsx");
  };

<<<<<<< HEAD
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h1 style={styles.title}>Attendance Dashboard</h1>

        <button style={styles.btnDanger} onClick={logout}>
          Logout
        </button>

        {/* INPUT */}
        <div style={styles.card}>

          {/* SAFE DROPDOWN */}
          {campers.length > 0 ? (
            <select
              style={styles.input}
              value={camperId}
              onChange={(e) => setCamperId(e.target.value)}
            >
              <option value="">Select Camper</option>
              {campers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              style={styles.input}
              placeholder="Camper ID"
              value={camperId}
              onChange={(e) => setCamperId(e.target.value)}
            />
          )}

          <input
            style={styles.input}
            placeholder="Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />

          <button style={styles.btnPrimary} onClick={checkIn}>
            Check In
          </button>

          <button style={styles.btnDanger} onClick={checkOut}>
            Check Out
          </button>

          <p>{message}</p>
        </div>

        {/* TABLE */}
        <div style={styles.card}>
          <button style={styles.btnSecondary} onClick={exportToExcel}>
            Export Excel
          </button>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Camper ID</th>
                <th style={styles.th}>Group ID</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Check In</th>
                <th style={styles.th}>Check Out</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}>{r.camper_id}</td>
                  <td style={styles.td}>{r.group_id}</td>
                  <td style={styles.td}>{r.date}</td>
                  <td style={styles.td}>
                    {new Date(r.check_in_time).toLocaleTimeString()}
                  </td>
                  <td style={styles.td}>
                    {r.check_out_time
                      ? new Date(r.check_out_time).toLocaleTimeString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Attendance;
const styles = {
  page: { background: "#f4f6f8", minHeight: "100vh" },
  container: { padding: "30px" },
  title: { fontSize: "26px" },

  card: {
    background: "#fff",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "12px"
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px"
  },

  btnPrimary: {
    background: "#2ecc71",
    color: "#fff",
    padding: "10px",
    border: "none",
    marginRight: "10px"
  },

  btnDanger: {
    background: "#e74c3c",
    color: "#fff",
    padding: "10px",
    border: "none"
  },

  btnSecondary: {
    background: "#3498db",
    color: "#fff",
    padding: "10px",
    border: "none"
  },

  table: {
    width: "100%",
    marginTop: "10px"
  },

  th: {
    padding: "10px",
    background: "#eee"
  },

  td: {
    padding: "10px",
    textAlign: "center"
  }
};
=======
  const filteredAttendance = records.filter((record) => {

    const matchesSearch =
      record.camper_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "present"
          ? !record.check_out_time
          : record.check_out_time;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <style>{styles}</style>

      <div className="attendance-root">

        <Navbar />

        <div className="attendance-body">

          <div className="attendance-header">

            <div className="attendance-title">
              Attendance Management
            </div>

            <div className="attendance-subtitle">
              Manage camper attendance professionally.
            </div>

          </div>

          <div className="attendance-grid">

            <div className="attendance-card">

              <div className="section-title">
                Attendance Actions
              </div>

              <select
                className="input"
                value={camperId}
                onChange={(e) => {

                  const id = e.target.value;

                  setCamperId(id);

                  const camper = campers.find(
                    (c) => c.id == id
                  );

                  setSelectedCamper(camper);
                }}
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

              <div className="medical-box">

                <strong>Medical Alerts:</strong>

                <div style={{ marginTop: "5px" }}>

                  {selectedCamper?.medical_alerts
                    ? selectedCamper.medical_alerts
                    : "None"}

                </div>

              </div>

              <select
                className="input"
                value={groupId}
                onChange={(e) =>
                  setGroupId(e.target.value)
                }
              >

                <option value="">
                  Select Group
                </option>

                {groups.map((g) => (

                  <option
                    key={g.id}
                    value={g.id}
                  >
                    {g.name}
                  </option>

                ))}

              </select>

              <div className="btn-group">

                <button
                  className="btn btn-green"
                  onClick={checkIn}
                >
                  Check In
                </button>

                <button
                  className="btn btn-red"
                  onClick={checkOut}
                >
                  Check Out
                </button>

                <button
                  className="btn btn-blue"
                  onClick={exportToExcel}
                >
                  Export Excel
                </button>

              </div>

              <div className="message">
                {message}
              </div>

            </div>

            <div className="attendance-right">

              <div className="attendance-card">

                <div className="section-title">
                  Attendance Records
                </div>

                <div className="filter-bar">

                  <input
                    type="text"
                    placeholder="Search camper..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="search-input"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="filter-select"
                  >

                    <option value="all">
                      All Status
                    </option>

                    <option value="present">
                      Present
                    </option>

                    <option value="checked_out">
                      Checked Out
                    </option>

                  </select>

                </div>

                {loading ? (

                  <div className="loading">
                    Loading attendance...
                  </div>

                ) : (

                  <table className="attendance-table">

                    <thead>
                      <tr>
                        <th>Camper</th>
                        <th>Group</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredAttendance.map((r, i) => (

                        <tr key={i}>

                          <td>{r.camper_name}</td>

                          <td>{r.group_name}</td>

                          <td>{r.date}</td>

                          <td>

                            {r.check_out_time ? (

                              <span className="status-badge checkedout">
                                Checked Out
                              </span>

                            ) : (

                              <span className="status-badge present">
                                Present
                              </span>

                            )}

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

              </div>

              <div className="attendance-card">

                <div className="section-title">
                  Currently Inside Camp
                </div>

                {!insideCamp.length ? (

                  <div className="loading">
                    No campers currently inside.
                  </div>

                ) : (

                  <table className="attendance-table">

                    <thead>
                      <tr>
                        <th>Camper</th>
                        <th>Group</th>
                        <th>Check In</th>
                      </tr>
                    </thead>

                    <tbody>

                      {insideCamp.map((r, i) => (

                        <tr key={i}>

                          <td>{r.camper_name}</td>

                          <td>{r.group_name}</td>

                          <td>
                            {r.check_in_time
                              ? new Date(r.check_in_time)
                                  .toLocaleTimeString()
                              : "—"}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default Attendance;
>>>>>>> 936b760 (Merge staff dashboard with parent portal project)
