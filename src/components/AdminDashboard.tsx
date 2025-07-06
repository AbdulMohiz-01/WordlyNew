import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import '../styles/AdminDashboard.css';
import type { UserData } from '../components/UserRegistrationModal';

interface UserSession {
  userId: string;
  action: string;
  difficulty?: string;
  word?: string;
  timestamp: number;
  userName?: string;
  result?: 'win' | 'loss';
  score?: number;
}

interface UserStats {
  totalUsers: number;
  totalSessions: number;
  activeUsers: number;
  gamesPlayed: number;
  averageScore: number;
  winRate: number;
  mostActiveDifficulty: string;
}

interface Filters {
  userName: string;
  action: string;
  difficulty: string;
  dateRange: {
    from: string;
    to: string;
  };
}

const AdminDashboard = () => {
  const { password } = useParams<{ password: string }>();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<UserSession[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalSessions: 0,
    activeUsers: 0,
    gamesPlayed: 0,
    averageScore: 0,
    winRate: 0,
    mostActiveDifficulty: 'medium'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Pagination state
  const [sessionsPage, setSessionsPage] = useState<number>(1);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [sessionsPerPage, setSessionsPerPage] = useState<number>(10);
  const [usersPerPage, setUsersPerPage] = useState<number>(10);
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    userName: '',
    action: '',
    difficulty: '',
    dateRange: {
      from: '',
      to: ''
    }
  });
  
  // Available filter options
  const [filterOptions, setFilterOptions] = useState<{
    actions: string[];
    difficulties: string[];
  }>({
    actions: [],
    difficulties: []
  });

  useEffect(() => {
    // Check if password is correct
    if (password !== '992233') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users and sessions
        const usersData = await UserService.getAllUsers();
        const sessionsData = await UserService.getAllSessions();
        
        // Enrich sessions with user names
        const enrichedSessions: UserSession[] = sessionsData.map((session: any) => {
          const user = usersData.find(u => u.id === session.userId);
          return {
            ...session,
            userName: user?.name || 'Unknown'
          };
        });
        
        // Extract filter options
        const actions = [...new Set(enrichedSessions.map(s => s.action))];
        const difficulties = [...new Set(enrichedSessions
          .filter(s => s.difficulty)
          .map(s => s.difficulty as string))];
        
        setFilterOptions({
          actions,
          difficulties
        });
        
        setSessions(enrichedSessions);
        setFilteredSessions(enrichedSessions);
        setUsers(usersData);
        setFilteredUsers(usersData);
        
        // Calculate stats
        const calculatedStats = calculateStats(usersData, enrichedSessions);
        setStats(calculatedStats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [password, navigate]);
  
  // Apply filters
  useEffect(() => {
    // Filter sessions
    let filtered = [...sessions];
    
    if (filters.userName) {
      filtered = filtered.filter(s => 
        s.userName?.toLowerCase().includes(filters.userName.toLowerCase())
      );
    }
    
    if (filters.action) {
      filtered = filtered.filter(s => s.action === filters.action);
    }
    
    if (filters.difficulty) {
      filtered = filtered.filter(s => s.difficulty === filters.difficulty);
    }
    
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from).getTime();
      filtered = filtered.filter(s => s.timestamp >= fromDate);
    }
    
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to).getTime() + 86400000; // Add one day to include the end date
      filtered = filtered.filter(s => s.timestamp <= toDate);
    }
    
    setFilteredSessions(filtered);
    setSessionsPage(1); // Reset to first page when filters change
    
    // Filter users
    let filteredUsersList = [...users];
    
    if (filters.userName) {
      filteredUsersList = filteredUsersList.filter(u => 
        u.name.toLowerCase().includes(filters.userName.toLowerCase())
      );
    }
    
    setFilteredUsers(filteredUsersList);
    setUsersPage(1); // Reset to first page when filters change
    
  }, [filters, sessions, users]);

  const calculateStats = (users: UserData[], sessions: UserSession[]): UserStats => {
    // Count games played
    const gamesPlayed = sessions.filter(s => s.action === 'new_game').length;
    
    // Count unique active users (users with at least one session)
    const activeUserIds = new Set(sessions.map(s => s.userId));
    const activeUsers = activeUserIds.size;
    
    // Calculate win rate
    const gameResults = sessions.filter(s => s.action === 'game_over');
    const wins = gameResults.filter(s => s.result === 'win').length;
    const winRate = gameResults.length > 0 ? (wins / gameResults.length) * 100 : 0;
    
    // Calculate average score
    const scores = gameResults.map(s => s.score || 0);
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
    
    // Find most active difficulty
    const difficultyCount: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.difficulty) {
        difficultyCount[s.difficulty] = (difficultyCount[s.difficulty] || 0) + 1;
      }
    });
    
    const mostActiveDifficulty = Object.entries(difficultyCount)
      .sort((a, b) => b[1] - a[1])
      .map(([difficulty]) => difficulty)[0] || 'medium';
    
    return {
      totalUsers: users.length,
      totalSessions: sessions.length,
      activeUsers,
      gamesPlayed,
      averageScore,
      winRate,
      mostActiveDifficulty
    };
  };
  
  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Filters] as any,
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      userName: '',
      action: '',
      difficulty: '',
      dateRange: {
        from: '',
        to: ''
      }
    });
  };
  
  // Get paginated data
  const getPaginatedSessions = () => {
    const startIndex = (sessionsPage - 1) * sessionsPerPage;
    return filteredSessions.slice(startIndex, startIndex + sessionsPerPage);
  };
  
  const getPaginatedUsers = () => {
    const startIndex = (usersPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  };
  
  // Pagination controls
  const totalSessionsPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const totalUsersPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void) => {
    const pages = [];
    
    // Previous button
    pages.push(
      <button 
        key="prev" 
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        &laquo;
      </button>
    );
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setPage(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button 
        key="next" 
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        &raquo;
      </button>
    );
    
    return (
      <div className="pagination">
        {pages}
      </div>
    );
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Wordly Admin Dashboard</h1>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Game
        </button>
      </header>

      <section className="stats-tiles">
        <div className="stat-tile total-users">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-tile active-users">
          <h3>Active Users</h3>
          <div className="stat-value">{stats.activeUsers}</div>
        </div>
        <div className="stat-tile games-played">
          <h3>Games Played</h3>
          <div className="stat-value">{stats.gamesPlayed}</div>
        </div>
        <div className="stat-tile win-rate">
          <h3>Win Rate</h3>
          <div className="stat-value">{stats.winRate.toFixed(1)}%</div>
        </div>
        <div className="stat-tile avg-score">
          <h3>Avg Score</h3>
          <div className="stat-value">{stats.averageScore.toFixed(1)}</div>
        </div>
        <div className="stat-tile popular-difficulty">
          <h3>Popular Difficulty</h3>
          <div className="stat-value">{stats.mostActiveDifficulty}</div>
        </div>
      </section>

      <section className="filter-section">
        <h2>Filters</h2>
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="userName">User Name:</label>
            <input
              type="text"
              id="userName"
              value={filters.userName}
              onChange={(e) => handleFilterChange('userName', e.target.value)}
              placeholder="Filter by user name"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="action">Action:</label>
            <select
              id="action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">All Actions</option>
              {filterOptions.actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="difficulty">Difficulty:</label>
            <select
              id="difficulty"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All Difficulties</option>
              {filterOptions.difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateFrom">Date From:</label>
            <input
              type="date"
              id="dateFrom"
              value={filters.dateRange.from}
              onChange={(e) => handleFilterChange('dateRange.from', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateTo">Date To:</label>
            <input
              type="date"
              id="dateTo"
              value={filters.dateRange.to}
              onChange={(e) => handleFilterChange('dateRange.to', e.target.value)}
            />
          </div>
          
          <button className="reset-filters-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </section>

      <section className="data-tables">
        <div className="table-container">
          <div className="table-header">
            <h2>Recent Sessions</h2>
            <div className="table-controls">
              <div className="records-per-page">
                <label htmlFor="sessionsPerPage">Show:</label>
                <select
                  id="sessionsPerPage"
                  value={sessionsPerPage}
                  onChange={(e) => setSessionsPerPage(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="results-count">
                Showing {Math.min(filteredSessions.length, sessionsPerPage)} of {filteredSessions.length} results
              </div>
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Difficulty</th>
                <th>Word</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedSessions().map((session, index) => (
                <tr key={index}>
                  <td>{session.userName}</td>
                  <td>{session.action}</td>
                  <td>{session.difficulty || '-'}</td>
                  <td>{session.word || '-'}</td>
                  <td>{formatDate(session.timestamp)}</td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="no-data">No sessions found</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {filteredSessions.length > 0 && (
            <div className="pagination-container">
              {renderPagination(sessionsPage, totalSessionsPages, setSessionsPage)}
            </div>
          )}
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>Registered Users</h2>
            <div className="table-controls">
              <div className="records-per-page">
                <label htmlFor="usersPerPage">Show:</label>
                <select
                  id="usersPerPage"
                  value={usersPerPage}
                  onChange={(e) => setUsersPerPage(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="results-count">
                Showing {Math.min(filteredUsers.length, usersPerPage)} of {filteredUsers.length} results
              </div>
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Platform</th>
                <th>Language</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedUsers().map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.browserInfo?.platform || '-'}</td>
                  <td>{user.browserInfo?.language || '-'}</td>
                  <td>{formatDate(user.timestamp)}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="no-data">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {filteredUsers.length > 0 && (
            <div className="pagination-container">
              {renderPagination(usersPage, totalUsersPages, setUsersPage)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard; 