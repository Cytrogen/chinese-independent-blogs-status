import React, {useState, useEffect, createContext, useContext, useMemo} from 'react';
import Papa from 'papaparse';
import BlogTable from './components/BlogTable';
import {
  Typography,
  CssBaseline,
  Box,
  CircularProgress,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            p: { xs: 1, sm: 2 },
            maxWidth: '1200px',
          }}
        >
          <Box sx={{ width: 48 }} />

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: '2.5rem' }
            }}
          >
            中文独立博客状态检查器
          </Typography>

          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>正在加载博客列表...</Typography>
          </Box>
        ) : (
          <Box sx={{
            width: '100%',
            p: { xs: 1, sm: 2 },
            display: 'flex',
            justifyContent: 'center'
          }}>
            <BlogTable allBlogs={allBlogs} />
          </Box>
        )}
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
