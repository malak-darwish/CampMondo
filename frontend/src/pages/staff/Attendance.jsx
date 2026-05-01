import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAuth } from "../../context/AuthContext";

function Attendance() {
  const { logout } = useAuth();

  const [camperId, setCamperId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage(data.message);

    setCamperId("");
    setGroupId("");

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
      return;
    }

    const formatted = records.map(r => ({
      CamperID: r.camper_id,
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

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(file, "attendance.xlsx");
  };

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