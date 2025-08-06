import React from 'react';
import {
	Box,
	Typography,
	Link,
	Paper,
	List,
	ListItem,
	ListItemIcon,
	Divider
} from '@mui/material';
import SourceIcon from '@mui/icons-material/Source';
import BuildIcon from '@mui/icons-material/Build';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import GitHubIcon from '@mui/icons-material/GitHub';

const AboutPage = () => {
	return (
		<Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: '900px', width: '100%' }}>
			<Typography variant="h4" component="h2" gutterBottom>
				关于本项目
			</Typography>
			<Divider sx={{ mb: 2 }} />

			<Box sx={{ mb: 3 }}>
				<Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
					<SourceIcon sx={{ mr: 1 }} /> 数据来源
				</Typography>
				<Typography variant="body1" paragraph>
					本网站所有博客数据均来源于 GitHub 上的开源项目{' '}
					<Link href="https://github.com/timqian/chinese-independent-blogs" target="_blank" rel="noopener noreferrer">
						chinese-independent-blogs
					</Link>
					，该项目遵循 MIT 协议。本项目旨在为这份列表提供一个可视化的界面，仅作学习和教育用途。
				</Typography>
			</Box>

			<Box sx={{ mb: 3 }}>
				<Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
					<BuildIcon sx={{ mr: 1 }} /> 功能说明
				</Typography>
				<List dense>
					<ListItem>
						<Typography variant="body1">
							<strong>状态检查：</strong> 本站会尝试访问列表中的每一个博客地址，以检查其是否仍然有效。这可以帮助用户筛选出可能已经失效或长期未更新的博客。
						</Typography>
					</ListItem>
					<ListItem>
						<Typography variant="body1">
							<strong>最新文章：</strong> 通过解析博客提供的 RSS feed 地址，本站可以获取并展示其最新文章的发布日期。
						</Typography>
					</ListItem>
				</List>
			</Box>

			<Box sx={{ mb: 3 }}>
				<Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
					<GppMaybeIcon sx={{ mr: 1 }} /> 免责声明
				</Typography>
				<List dense>
					<ListItem>
						<Typography variant="body1">
							<strong>状态不准确：</strong> 由于网络波动、目标服务器防火墙策略或 DNS 问题，<strong>“状态”</strong>一栏的结果可能并不完全准确。一个显示为“失效”的博客可能只是暂时无法从我们的服务器访问。
						</Typography>
					</ListItem>
					<ListItem>
						<Typography variant="body1">
							<strong>RSS 限制：</strong> <strong>“最新文章”</strong>的提取完全依赖于原项目提供的 RSS 地址。如果该地址为空、已失效，或 RSS 格式较为特殊，本站的解析器可能无法正确获取日期，此时将显示为“N/A”。
						</Typography>
					</ListItem>
				</List>
			</Box>

			<Box>
				<Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
					<GitHubIcon sx={{ mr: 1 }} /> 开源与贡献
				</Typography>
				<Typography variant="body1" paragraph>
					本站是一个完全开源的项目，欢迎您查看源代码、提出建议或参与贡献。
				</Typography>
				<Link href="https://github.com/Cytrogen/chinese-independent-blogs-status" target="_blank" rel="noopener noreferrer">
					访问 GitHub 仓库
				</Link>
			</Box>
		</Paper>
	);
};

export default AboutPage;
