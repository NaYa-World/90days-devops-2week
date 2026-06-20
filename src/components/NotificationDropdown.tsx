import React from 'react';

interface NotificationItem {
  text: string;
  date: string;
  read: boolean;
}

interface NotificationDropdownProps {
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  markNotificationsRead: () => void;
  clearNotifications: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isNotifOpen,
  setIsNotifOpen,
  notifications,
  markNotificationsRead,
  clearNotifications
}) => {
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="nav-btn"
        onClick={() => {
          setIsNotifOpen(!isNotifOpen);
          markNotificationsRead();
        }}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              background: 'var(--red)',
              color: '#fff',
              borderRadius: '50%',
              padding: '1px 5px',
              fontSize: '9px',
              fontWeight: 'bold'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isNotifOpen && (
        <div
          style={{
            position: 'absolute',
            top: '38px',
            right: 0,
            width: '280px',
            background: 'var(--s1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            zIndex: 500,
            textAlign: 'left'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '8px',
              marginBottom: '8px'
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text)' }}>🔔 Notifications</span>
            <button
              onClick={clearNotifications}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '10px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              Clear All
            </button>
          </div>
          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {!notifications || notifications.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '11px', textAlign: 'center', padding: '12px 0' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '11.5px',
                    padding: '6px 8px',
                    background: 'var(--s2)',
                    borderRadius: '8px',
                    borderLeft: n.read ? 'none' : '3px solid var(--green)'
                  }}
                >
                  <div style={{ color: 'var(--text)', lineHeight: '1.4' }}>{n.text}</div>
                  <div style={{ fontSize: '8px', color: 'var(--muted)', marginTop: '3px', textAlign: 'right' }}>
                    {n.date}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
