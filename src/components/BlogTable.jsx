import React, { useState, useEffect, useRef } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Chip,
	Link,
	Tooltip,
	Box,
	TablePagination,
	Pagination,
	Typography,
	Card,
	CardContent,
	useTheme,
	useMediaQuery,
} from '@mui/material';
import RssFeedIcon from '@mui/icons-material/RssFeed';

const checkStatus = async (blogUrl) => {
	if (!blogUrl || typeof blogUrl !== 'string' || !blogUrl.includes('.')) return 'error';
	try {
		const response = await fetch(`/api/check-status?url=${encodeURIComponent(blogUrl.trim())}`);
		const data = await response.json();
		return data.status;
	} catch (error) { return 'error'; }
};

const getLatestPost = async (rssUrl) => {
	if (!rssUrl || typeof rssUrl !== 'string' || !rssUrl.includes('.')) return null;
	try {
		const response = await fetch(`/api/get-latest-post?rssUrl=${encodeURIComponent(rssUrl.trim())}`);
		const data = await response.json();
		return data.latestPostDate;
	} catch (error) { return null; }
};

const BlogTable = ({ blogs }) => {
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [blogData, setBlogData] = useState({});
	const [isPageLoading, setIsPageLoading] = useState(false);

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const blogDataRef = useRef(blogData);
	useEffect(() => {
		blogDataRef.current = blogData;
	});

	useEffect(() => {
		setPage(1);
	}, [blogs]);

	useEffect(() => {
		const fetchCurrentPageData = async () => {
			const startIndex = (page - 1) * rowsPerPage;
			const endIndex = startIndex + rowsPerPage;
			const currentPageBlogs = blogs.slice(startIndex, endIndex);

			const blogsToFetch = currentPageBlogs.filter(blog => !blogDataRef.current[blog.Address.trim()]);

			if (blogsToFetch.length === 0) {
				return; // 如果本页数据都已缓存，则什么都不做
			}

			setIsPageLoading(true);

			const promises = blogsToFetch.map(async (blog) => {
				const address = blog.Address.trim();
				const rssFeed = blog['RSS feed']?.trim();

				const status = await checkStatus(address);
				const latestPostDate = await getLatestPost(rssFeed);

				return { address, data: { status, latestPostDate } };
			});

			const results = await Promise.allSettled(promises);

			const newBlogEntries = {};
			results.forEach(result => {
				if (result.status === 'fulfilled' && result.value) {
					newBlogEntries[result.value.address] = result.value.data;
				}
			});

			if (Object.keys(newBlogEntries).length > 0) {
				setBlogData(prevData => ({
					...prevData,
					...newBlogEntries
				}));
			}

			setIsPageLoading(false);
		};

		if (blogs.length > 0) {
			fetchCurrentPageData();
		}
	}, [page, rowsPerPage, blogs]);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(1);
	};

	const getStatusChip = (status) => {
		if (status === 'ok') return <Chip label="正常" color="success" size="small" />;
		if (status === 'error') return <Chip label="失效" color="error" size="small" />;
		return <CircularProgress size={20} />; // 如果没有状态，则显示加载中
	};

	const visibleBlogs = blogs.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage);

	const PaginationControls = () => (
		<Box sx={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			p: 2,
			flexDirection: { xs: 'column', sm: 'row' },
			gap: 2
		}}>
			<TablePagination
				component="div" count={blogs.length} rowsPerPage={rowsPerPage} page={page - 1}
				onPageChange={() => {}} onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[10, 25, 50, 100]} ActionsComponent={() => null}
				labelRowsPerPage="每页行数:"
				labelDisplayedRows={() => `总数: ${blogs.length}`}
			/>
			<Pagination
				count={Math.ceil(blogs.length / rowsPerPage)} page={page} onChange={handleChangePage}
				color="primary" showFirstButton showLastButton
				size={isMobile ? 'small' : 'medium'}
			/>
		</Box>
	);

	return (
		<Paper sx={{ width: '100%', maxWidth: '1200px', overflow: 'hidden', position: 'relative' }}>
			{isPageLoading && (
				<Box
					sx={{
						position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
						backgroundColor: 'rgba(255, 255, 255, 0.7)', display: 'flex',
						flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2,
					}}
				>
					<CircularProgress />
					<Typography sx={{ mt: 2, fontWeight: 'bold' }}>正在获取本页数据...</Typography>
				</Box>
			)}

			{blogs.length === 0 && !isPageLoading && (
				<Box sx={{ textAlign: 'center', p: 4, minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
					<Typography variant="h6">未找到匹配的博客</Typography>
					<Typography color="text.secondary">请尝试更改您的搜索条件。</Typography>
				</Box>
			)}

			{isMobile ? (
				// 移动端
				<Box sx={{ p: 1, minHeight: 300 }}>
					{visibleBlogs.map((blog) => {
						const address = blog.Address.trim();
						const rssFeed = blog['RSS feed']?.trim();
						const data = blogData[address];
						return (
							<Card key={address} sx={{ mb: 2 }}>
								<CardContent>
									<Typography variant="h6" component="div" gutterBottom>
										{blog.Introduction}
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
										<Link href={address} target="_blank" rel="noopener noreferrer" underline="hover">
											{address}
										</Link>
									</Typography>
									{blog.tags && <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>标签: {blog.tags}</Typography>}
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
										<Typography variant="body2">状态:</Typography>
										{getStatusChip(data?.status)}
									</Box>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
										<Typography variant="body2">最新文章:</Typography>
										<Typography variant="body2">
											{data ? (data.latestPostDate ? new Date(data.latestPostDate).toLocaleDateString() : 'N/A') : <CircularProgress size={20} />}
										</Typography>
									</Box>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<Typography variant="body2">RSS:</Typography>
										{rssFeed ? (
											<Tooltip title="点击订阅 RSS">
												<Link href={rssFeed} target="_blank" rel="noopener noreferrer">
													<RssFeedIcon color="warning" />
												</Link>
											</Tooltip>
										) : ('N/A')}
									</Box>
								</CardContent>
							</Card>
						);
					})}
				</Box>
			) : (
				// 桌面端
				<TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
					<Table stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell>名称</TableCell>
								<TableCell>地址</TableCell>
								<TableCell sx={{width: '20%'}}>标签</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>状态</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>最新文章</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>RSS</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{visibleBlogs.map((blog) => {
								const address = blog.Address.trim();
								const rssFeed = blog['RSS feed']?.trim();
								const data = blogData[address];
								return (
									<TableRow hover key={address}>
										<TableCell>{blog.Introduction}</TableCell>
										<TableCell sx={{ wordBreak: 'break-all' }}>
											<Link href={address} target="_blank" rel="noopener noreferrer" underline="hover">
												{address}
											</Link>
										</TableCell>
										<TableCell>{blog.tags}</TableCell>
										<TableCell align="center">{getStatusChip(data?.status)}</TableCell>
										<TableCell align="center">
											{data ? (data.latestPostDate ? new Date(data.latestPostDate).toLocaleDateString() : 'N/A') : <CircularProgress size={20} />}
										</TableCell>
										<TableCell align="center">
											{rssFeed ? (
												<Tooltip title="点击订阅 RSS">
													<Link href={rssFeed} target="_blank" rel="noopener noreferrer">
														<RssFeedIcon color="warning" />
													</Link>
												</Tooltip>
											) : ('N/A')}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<PaginationControls />
		</Paper>
	);
};

export default BlogTable;
