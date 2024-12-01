import React, { useEffect, useState } from 'react';
import './Applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to fetch applications from the backend API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError("Failed to load applications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="applications-container">
        <div className="loading-spinner">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <header className="applications-header">
        <h2>My Applications</h2>
        <p>Track all your college applications here</p>
      </header>

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>You haven't submitted any applications yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="applications-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>College Name</th>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={app.application_id}>
                  <td>{index + 1}</td>
                  <td>{app.college_name}</td>
                  <td>{app.name}</td>
                  <td>{app.email_id}</td>
                  <td>{formatDate(app.date_applied)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Applications;