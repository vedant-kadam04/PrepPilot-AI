import { useEffect, useState } from "react";
import { useParams , useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Report.css";

function Report() {
  const { id } = useParams();
  const navigate=useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/interviews/${id}/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!report)
    return <h2 style={{ textAlign: "center" }}>Loading Report...</h2>;

  return (
    <div className="report-page">
      <h1 className="report-title">Interview Report</h1>

      <div className="report-summary">
        <h2>{report.title}</h2>

        <div className="report-meta">
          <span>💼 {report.role}</span>
          <span>📈 {report.difficulty}</span>
        </div>
        <p>
          <strong>Performance:</strong> {report.performance}
        </p>

        <div className="score-grid">
          <div className="score-card">
            <h3>{report.averageScore}/10</h3>
            <p>Average Score</p>
          </div>

          <div className="score-card">
            <h3>{report.highestScore}/10</h3>
            <p>Highest Score</p>
          </div>

          <div className="score-card">
            <h3>{report.lowestScore}/10</h3>
            <p>Lowest Score</p>
          </div>

          <div className="score-card">
            <h3>{report.totalQuestions}</h3>
            <p>Questions</p>
            <h3>{report.totalAnswers}</h3>
            <p>Answers</p>
          </div>
        </div>
      </div>

      <h2 className="analysis-title">Question-wise Analysis</h2>

      {report.answers.map((item, index) => (
        <div className="analysis-card">
          <h3>Question {index + 1}</h3>

          <p>
            <strong>Question:</strong>
            <br />
            {item.question}
          </p>

          <p>
            <strong>Your Answer:</strong>
            <br />
            {item.answer || "No answer submitted"}
          </p>

          <p>
            <strong>Score:</strong>

            <span
              className={
                item.score >= 8
                  ? "score excellent"
                  : item.score >= 5
                    ? "score average"
                    : "score poor"
              }
            >
              {item.score}/10
            </span>
          </p>

          <h4>💬 Feedback</h4>
          <p>{item.feedback}</p>

          <h4>🚀 Improvement</h4>
          <p>{item.improvement}</p>
        </div>
      ))}
      <div className="report-actions">
        <button className="dashboard-btn"
        onClick={()=> navigate("/dashboard")}>Back To Dashboard</button>
      </div>
    </div>
  );
}

export default Report;
