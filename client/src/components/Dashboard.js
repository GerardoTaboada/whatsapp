import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import QRCode from 'react-qr-code';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [qrCode, setQrCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    phoneNumber: '',
    message: '',
    scheduledTime: ''
  });

  useEffect(() => {
    if (user) {
      // Initialize WhatsApp client
      axios.post('/api/whatsapp/init', { userId: user.id })
        .catch(err => console.error(err));

      // Load scheduled messages
      loadScheduledMessages();
    }
  }, [user]);

  const loadScheduledMessages = () => {
    axios.get(`/api/whatsapp/scheduled/${user.id}`)
      .then(res => setScheduledMessages(res.data))
      .catch(err => console.error(err));
  };

  const handleWhatsAppConnect = () => {
    // Get QR code
    axios.get(`/api/whatsapp/qr/${user.id}`)
      .then(res => {
        setQrCode(res.data.qr);
      })
      .catch(err => console.error(err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleMessage = (e) => {
    e.preventDefault();
    axios.post('/api/whatsapp/schedule', {
      userId: user.id,
      ...newMessage
    })
    .then(() => {
      setNewMessage({
        phoneNumber: '',
        message: '',
        scheduledTime: ''
      });
      loadScheduledMessages();
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>WhatsApp Scheduler</h1>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="whatsapp-connection">
          <h2>WhatsApp Connection</h2>
          {!isConnected ? (
            <div>
              <button onClick={handleWhatsAppConnect} className="connect-button">
                Connect WhatsApp
              </button>
              {qrCode && (
                <div className="qr-container">
                  <p>Scan this QR code with your WhatsApp mobile app:</p>
                  <QRCode value={qrCode} size={256} />
                </div>
              )}
            </div>
          ) : (
            <div className="connection-status connected">
              WhatsApp Connected
            </div>
          )}
        </div>

        <div className="message-scheduler">
          <h2>Schedule New Message</h2>
          <form onSubmit={handleScheduleMessage}>
            <div className="form-group">
              <label>Phone Number (with country code)</label>
              <input 
                type="text" 
                name="phoneNumber"
                value={newMessage.phoneNumber}
                onChange={handleInputChange}
                placeholder="e.g. 5491112345678"
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea 
                name="message"
                value={newMessage.message}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date & Time</label>
              <input 
                type="datetime-local" 
                name="scheduledTime"
                value={newMessage.scheduledTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="schedule-button">
              Schedule Message
            </button>
          </form>
        </div>

        <div className="scheduled-messages">
          <h2>Scheduled Messages</h2>
          {scheduledMessages.length === 0 ? (
            <p>No messages scheduled yet.</p>
          ) : (
            <ul>
              {scheduledMessages.map(msg => (
                <li key={msg.id}>
                  <div className="message-info">
                    <div><strong>To:</strong> {msg.phone_number}</div>
                    <div><strong>When:</strong> {new Date(msg.scheduled_time).toLocaleString()}</div>
                    <div><strong>Status:</strong> {msg.status}</div>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
