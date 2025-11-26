import React, { useEffect, useState, useRef } from 'react';
import PostList from '../components/PostList';
import OnlineUsersSidebar from '../components/OnlineUsersSidebar';
import CreateGroup from './groups/Groups.js';
import { Link } from 'react-router-dom';
import Onlineuser from '../components/icon/onlineuser';
import Groupicon from '../components/icon/groupsicon';
import Menuicon from '../components/icon/menuicon';
import Loading from '../components/icon/loading';
import Newspost from '../components/whatisnew/news';
import Coolevents from './addCoolactivities/Evenlistverticalview.js';
import TestimonialCarousel from './banners/Testimonial.js';
import NewsCarousel from '../components/whatisnew/NewsCarousel';

const UserHome = ({ user, posts, onRefresh, onLike, likes, userLiked, onLogout, navigateToProfile }) => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const postsPerPage = 20;
  const [groupId, setGroupId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (posts && posts.length) setLoading(false);
  }, [posts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return <p>Please log in to view the posts.</p>;

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const toggleSidebar = (sidebar) => {
    if (sidebar === 'groups') {
      setShowGroups(!showGroups);
      setShowOnlineUsers(false);
      setShowNews(false);
    } else if (sidebar === 'online') {
      setShowOnlineUsers(!showOnlineUsers);
      setShowGroups(false);
      setShowNews(false);
    } else if (sidebar === 'news') {
      setShowNews(!showNews);
      setShowGroups(false);
      setShowOnlineUsers(false);
    }
    setShowDropdown(false);
  };

  const closeSidebar = () => {
    setShowGroups(false);
    setShowOnlineUsers(false);
    setShowNews(false);
  };

  return (
    <div
      className="home-container"
      style={{
        maxWidth: '100%',
        margin: 'auto',
        padding: '1px clamp(10px, 0vw, 120px) 10px clamp(10px, 0vw, 120px)',
      }}
    >
      {loading ? (
        <p style={{ textAlign: 'center' }}>
          <Loading />
        </p>
      ) : (
        <>
          <div
            className="main-layout"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 40px)',
              overflow: 'hidden',
            }}
          >
            {/* ✅ Mobile Dropdown Menu */}
            {isMobile && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  borderBottom: '1px solid #ffffffff',
                  boxShadow: '0 0px 0px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '1px 15px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    <Menuicon />
                  </span>
                </div>
                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      backgroundColor: '#fff',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      zIndex: 20,
                    }}
                  >
                    <div
                      onClick={() => toggleSidebar('groups')}
                      style={{
                        padding: '12px 15px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: showGroups ? '#f0f0f0' : 'transparent',
                      }}
                    >
                      Groups
                    </div>
                    <div
                      onClick={() => toggleSidebar('online')}
                      style={{
                        padding: '12px 15px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: showOnlineUsers ? '#f0f0f0' : 'transparent',
                      }}
                    >
                      Online Users
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              className="content-area"
              style={{ display: 'flex', flexDirection: 'row', height: '100%' }}
            >
              {/* ✅ Sidebar (Desktop) */}
              {!isMobile && (
                <div
                  className="sidebar-icons"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '20px 10px',
                    backgroundColor: '#f8f9fa',
                    borderRight: '1px solid #e9ecef',
                    boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                    zIndex: 10,
                    minWidth: '40px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    onClick={() => toggleSidebar('groups')}
                    className="icon-button"
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: showGroups ? '#e2e6ea' : 'transparent',
                      textAlign: 'center',
                      transition: '0.2s',
                    }}
                  >
                    <Groupicon />
                    <p style={{ fontSize: '10px', color: '#6c757d', fontWeight: 'bold' }}>Groups</p>
                  </div>

                  <div
                    onClick={() => toggleSidebar('online')}
                    className="icon-button"
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: showOnlineUsers ? '#e2e6ea' : 'transparent',
                      textAlign: 'center',
                      transition: '0.2s',
                    }}
                  >
                    <Onlineuser />
                    <p style={{ fontSize: '10px', color: '#6c757d', fontWeight: 'bold' }}>Online</p>
                  </div>
                </div>
              )}

              {/* ✅ Conditional Sidebars */}
              {showGroups && (
                <div
                  className="groups-sidebar"
                  style={{
                    width: isMobile ? '90%' : '400px',
                    maxWidth: '95vw',
                    borderRight: isMobile ? 'none' : '1px solid #e9ecef',
                    overflowY: 'auto',
                    padding: '15px',
                    background: '#f8f9fa',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    position: isMobile ? 'fixed' : 'static',
                    top: isMobile ? '50%' : 'auto',
                    left: isMobile ? '50%' : 'auto',
                    transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                    height: isMobile ? '80%' : 'auto',
                    maxHeight: '90vh',
                    zIndex: 1000,
                    borderRadius: isMobile ? '12px' : '0',
                    margin: isMobile ? '0' : '40px auto',
                  }}
                >
                  {isMobile && (
                    <button
                      onClick={closeSidebar}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                      }}
                    >
                      &times;
                    </button>
                  )}
                  <CreateGroup user={user} groupId={groupId} />
                </div>
              )}

              {showOnlineUsers && (
                <div
                  className="online-users-sidebar"
                  style={{
                    width: isMobile ? '90%' : '400px',
                    maxWidth: '95vw',
                    borderRight: isMobile ? 'none' : '1px solid #e9ecef',
                    overflowY: 'auto',
                    padding: '15px',
                    background: '#f8f9fa',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    position: isMobile ? 'fixed' : 'static',
                    top: isMobile ? '50%' : 'auto',
                    left: isMobile ? '50%' : 'auto',
                    transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                    height: isMobile ? '80%' : 'auto',
                    maxHeight: '90vh',
                    zIndex: 1000,
                    borderRadius: isMobile ? '12px' : '0',
                    margin: isMobile ? '0' : '40px auto',
                  }}
                >
                  {isMobile && (
                    <button
                      onClick={closeSidebar}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                      }}
                    >
                      &times;
                    </button>
                  )}
                  <OnlineUsersSidebar user={user} />
                </div>
              )}

              {/* ✅ Main Content */}
              <div
                className="main-content"
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  backgroundColor: '#fff',
                  padding: '15px',
                  overflowX: 'hidden',
                }}
              >
                <Coolevents />
                <br />
                <PostList
                  posts={currentPosts}
                  user={user}
                  onReply={() => {}}
                  onRefresh={onRefresh}
                  onLike={onLike}
                  likes={likes}
                  userLiked={userLiked}
                />
                <NewsCarousel user={user} style={{
               margin:'10px',
                }} /> 
              </div>
            </div>
          </div>

    

       
        </>
      )}
    </div>
  );
};

export default UserHome;
