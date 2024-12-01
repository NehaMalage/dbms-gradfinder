import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Search.css';

function FindColleges() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() !== '') {
        search(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const search = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/search', { params: { query: searchQuery } });
      setSuggestions(response.data.map((item) => item.college_name || 'Unnamed College'));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    setApplied(false);
    setShowForm(false);

    try {
      const response = await axios.get('http://localhost:8080/api/college-details', {
        params: { college_name: suggestion },
      });
      setCollegeDetails(response.data || null);
    } catch (error) {
      console.error('Error fetching college details:', error);
      setCollegeDetails(null);
    }
  };

  const handleApplyClick = () => {
    setShowForm(true);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setFormError('Please fill out all fields.');
      return;
    }

    const applicationData = {
      college_id: collegeDetails.college_id,
      name: formData.name,
      email_id: formData.email,
      date_applied: new Date().toISOString().split('T')[0],
    };

    try {
      await axios.post('http://localhost:8080/api/apply', applicationData);
      setApplied(true);
      setShowForm(false);
      setFormData({ name: '', email: '' });
      setFormError('');
    } catch (error) {
      console.error('Error applying for college:', error);
      setFormError('Failed to submit application. Please try again.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('query');
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [location.search]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>College Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a college..."
        style={{
          width: '300px',
          padding: '10px',
          fontSize: '16px',
        }}
      />
      {loading && <div>Loading...</div>}
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyleType: 'none',
            padding: 0,
            margin: '10px 0',
            border: '1px solid #ddd',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: index !== suggestions.length - 1 ? '1px solid #ddd' : 'none',
              }}
              role="button"
              aria-label={`Select ${suggestion}`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {collegeDetails && (
        <div style={{ marginTop: '20px' }}>
          <h3>College Details</h3>
          <p><strong>Country:</strong> {collegeDetails.country}</p>
          <p><strong>Program Offered:</strong> {collegeDetails.program_offered}</p>
          <p><strong>Last Date of Application:</strong> {collegeDetails.last_date_of_application}</p>
          <p><strong>On-Campus Accommodation:</strong> {collegeDetails.on_campus_accommodation}</p>
          <p><strong>Max Roommates:</strong> {collegeDetails.max_roommates}</p>
          <p><strong>Previous Qualifications Required:</strong> {collegeDetails.previous_qualifications_required}</p>

          {showForm ? (
            <form onSubmit={handleFormSubmit} style={{ marginTop: '20px' }}>
              <h4>Application Form</h4>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    style={{ 
                      width: '100%',
                      padding: '8px',
                      marginTop: '5px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    style={{ 
                      width: '100%',
                      padding: '8px',
                      marginTop: '5px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </label>
              </div>
              {formError && <p style={{ color: 'red', marginTop: '10px' }}>{formError}</p>}
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Submit Application
              </button>
            </form>
          ) : (
            <button
              onClick={handleApplyClick}
              style={{
                padding: '10px 20px',
                backgroundColor: applied ? 'green' : '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px',
              }}
              disabled={applied}
            >
              {applied ? 'Application Submitted' : 'Apply Now'}
            </button>
          )}
        </div>
      )}
      {!loading && suggestions.length === 0 && query.trim() !== '' && (
        <p style={{ color: 'gray' }}>No results found</p>
      )}
    </div>
  );
}

export default FindColleges;