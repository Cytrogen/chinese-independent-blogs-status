import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
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
  Drawer, List,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import { Helmet } from 'react-helmet-async';
import BlogTable from './components/BlogTable';
import AboutPage from "./components/AboutPage.jsx";

const ColorModeContext = createContext({ toggleColorMode: () => {} });
const drawerWidth = 240;

function App() {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          // 将新的主题模式保存到 localStorage
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
          mode, // 'light' 或 'dark'
        },
      }),
    [mode],
  );

  const AppContent = () => {
    const [allBlogs, setAllBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('main');
    const [mobileOpen, setMobileOpen] = useState(false);

    const colorMode = useContext(ColorModeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
      const fetchBlogs = () => {
        Papa.parse('https://raw.githubusercontent.com/timqian/chinese-independent-blogs/master/blogs-original.csv', {
          download: true,
          header: true,
          transformHeader: header => header.trim(),
          complete: (results) => {
            console.log('Papaparse Raw Results:', results);

            // 过滤掉无效数据
            const validBlogs = results.data.filter(blog =>
              blog.Address && typeof blog.Address === 'string' && blog.Address.trim().length > 5
            );

            console.log('Number of valid blogs found:', validBlogs.length);

            setAllBlogs(validBlogs);
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

    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
      <div>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" component="div">菜单</Typography>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setCurrentView('main'); if(isMobile) handleDrawerToggle(); }}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="主页" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setCurrentView('about'); if(isMobile) handleDrawerToggle(); }}>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary="关于" />
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
              <ListItemText primary="切换主题" />
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    );

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100svh',
          width: '100vw',
          bgcolor: 'background.default',
          transition: 'background-color 0.3s',
        }}
      >
        <Helmet>
          <title>中文独立博客状态检查器 | 发现活跃的创作者</title>
          <meta name="description" content="一个用于检查和筛选 chinese-independent-blogs 列表中博客状态的工具，帮助您找到仍在活跃更新的中文独立博客。" />
        </Helmet>
        <Box
          component="nav"
          sx={{
            width: { md: drawerWidth },
            flexShrink: { md: 0 },
          }}
        >
          {/* 移动端抽屉 */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawerContent}
          </Drawer>
          {/* 桌面端常驻抽屉 */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* 主内容区 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2 }}>
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
            {/* 占位符，确保桌面端标题居中 */}
            <Box sx={{ width: 48, display: { xs: 'none', md: 'block' } }} />
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>正在加载博客列表...</Typography>
            </Box>
          ) : (
            currentView === 'main'
              ? <BlogTable allBlogs={allBlogs} />
              : <AboutPage />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
