import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import {
  Typography,
  CssBaseline,
  Box,
  CircularProgress,
  IconButton,
  useMediaQuery,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  TextField,
  Tooltip,
  GlobalStyles,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Helmet } from 'react-helmet-async';
import BlogTable from './components/BlogTable';
import AboutPage from "./components/AboutPage.jsx";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

const defaultDrawerWidth = 240;
const minDrawerWidth = 80;
const maxDrawerWidth = 500;

function App() {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  const AppContent = () => {
    const [allBlogs, setAllBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('main');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [drawerWidth, setDrawerWidth] = useState(defaultDrawerWidth);
    const [isResizing, setIsResizing] = useState(false);

    const colorMode = useContext(ColorModeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isCollapsed = drawerWidth === minDrawerWidth;

    useEffect(() => {
      const fetchBlogs = () => {
        Papa.parse('https://raw.githubusercontent.com/timqian/chinese-independent-blogs/master/blogs-original.csv', {
          download: true,
          header: true,
          transformHeader: header => header.trim(),
          complete: (results) => {
            const validBlogs = results.data.filter(blog =>
              blog.Address && typeof blog.Address === 'string' && blog.Address.trim().length > 5
            );
            setAllBlogs(validBlogs);
            setFilteredBlogs(validBlogs);
            setLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setLoading(false);
          }
        });
      };
      fetchBlogs();
    }, []);

    useEffect(() => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) {
        setFilteredBlogs(allBlogs);
        return;
      }
      let blogsToFilter = allBlogs;
      if (query.startsWith('title:')) {
        const titleQuery = query.substring(6).trim();
        blogsToFilter = allBlogs.filter(blog => blog.Introduction && blog.Introduction.toLowerCase().includes(titleQuery));
      } else if (query.startsWith('tag:')) {
        const tagQuery = query.substring(4).trim();
        blogsToFilter = allBlogs.filter(blog => blog.tags && blog.tags.toLowerCase().includes(tagQuery));
      } else if (query.startsWith('address:')) {
        const addressQuery = query.substring(8).trim();
        blogsToFilter = allBlogs.filter(blog => blog.Address && blog.Address.toLowerCase().includes(addressQuery));
      } else {
        blogsToFilter = allBlogs.filter(blog =>
          (blog.Introduction && blog.Introduction.toLowerCase().includes(query)) ||
          (blog.tags && blog.tags.toLowerCase().includes(query)) ||
          (blog.Address && blog.Address.toLowerCase().includes(query))
        );
      }
      setFilteredBlogs(blogsToFilter);
    }, [searchQuery, allBlogs]);

    const handleMouseDown = (e) => {
      e.preventDefault();
      setIsResizing(true);
    };

    const handleMouseUp = useCallback(() => {
      setIsResizing(false);
    }, []);

    const handleMouseMove = useCallback((e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= minDrawerWidth && newWidth <= maxDrawerWidth) {
          setDrawerWidth(newWidth);
        }
      }
    }, [isResizing]);

    const toggleCollapse = () => {
      setDrawerWidth(isCollapsed ? defaultDrawerWidth : minDrawerWidth);
    };

    useEffect(() => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [handleMouseMove, handleMouseUp]);


    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          {!isCollapsed && <Typography variant="h6" component="div">菜单</Typography>}
        </Box>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setCurrentView('main'); if(isMobile) handleDrawerToggle(); }}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="主页" />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setCurrentView('about'); if(isMobile) handleDrawerToggle(); }}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="关于" />}
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={colorMode.toggleColorMode}>
              <ListItemIcon>
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="切换主题" />}
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <IconButton onClick={toggleCollapse}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      </Box>
    );

    const searchHelpText = (
      <React.Fragment>
        <Typography color="inherit" sx={{ fontWeight: 'bold', mb: 1 }}>搜索语法提示</Typography>
        <Box component="ul" sx={{ p: 0, m: 0, pl: 2 }}>
          <li><b>title:关键字</b> - 搜索博客名称</li>
          <li><b>tag:关键字</b> - 搜索博客标签</li>
          <li><b>address:关键字</b> - 搜索博客地址</li>
        </Box>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          直接输入关键字将同时搜索以上所有字段。
        </Typography>
      </React.Fragment>
    );

    return (
      <Box sx={{ display: 'flex', minHeight: '100svh' }}>
        <Helmet>
          <title>中文独立博客状态检查器 | 发现活跃的创作者</title>
          <meta name="description" content="一个用于检查和筛选 chinese-independent-blogs 列表中博客状态的工具，帮助您找到仍在活跃更新的中文独立博客。" />
        </Helmet>

        <CssBaseline />

        <GlobalStyles styles={{
          'html, body, #root': {
            height: '100%',
            width: '100%',
            margin: 0,
            padding: 0,
          }
        }} />

        <Drawer
          component="nav"
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              overflowX: 'hidden',
              position: 'relative',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
            flexShrink: 0,
          }}
          open
        >
          {drawerContent}
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              width: '5px',
              cursor: 'ew-resize',
              height: '100%',
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              }
            }}
          />
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '1200px', mb: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                textAlign: { xs: 'left', md: 'center' },
                flexGrow: 1,
                fontSize: { xs: '1.5rem', sm: '2.5rem' }
              }}
            >
              中文独立博客状态检查器
            </Typography>
            <Box sx={{ width: 48, display: { xs: 'none', md: 'block' } }} />
          </Box>

          {currentView === 'main' && !loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '1200px', mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="搜索博客…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Tooltip title={searchHelpText} arrow>
                <IconButton color="primary" sx={{ ml: 1 }}>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>正在加载博客列表...</Typography>
            </Box>
          ) : (
            currentView === 'main'
              ? <BlogTable blogs={filteredBlogs} />
              : <AboutPage />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
