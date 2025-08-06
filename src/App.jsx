import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import BlogTable from './components/BlogTable';
import {Container, Typography, CssBaseline, Box, CircularProgress} from '@mui/material';

function App() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100svh',
          width: '100svw',
          p: { xs: 2, sm: 3 },
          bgcolor: '#f4f6f8',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            mb: 4,
            fontWeight: 'bold',
            color: 'text.primary',
            textAlign: 'center',
            fontSize: { xs: '2rem', sm: '2.5rem' }
          }}
        >
          中文独立博客状态检查器
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>正在加载博客列表...</Typography>
          </Box>
        ) : (
          <BlogTable allBlogs={allBlogs} />
        )}
      </Box>
    </>
  );
}

export default App;
