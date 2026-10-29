import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './site.css';
import './admin.css';

import Layout from './site/Layout.jsx';
import Home from './site/Home.jsx';
import Article from './site/Article.jsx';
import Listing from './site/Listing.jsx';
import { Stories, StoryView } from './site/Stories.jsx';
import Page from './site/Page.jsx';

import AdminLayout from './admin/AdminLayout.jsx';
import Login from './admin/Login.jsx';
import Dashboard from './admin/Dashboard.jsx';
import Articles from './admin/Articles.jsx';
import ArticleEdit from './admin/ArticleEdit.jsx';
import Categories from './admin/Categories.jsx';
import Sections from './admin/Sections.jsx';
import AdminStories from './admin/AdminStories.jsx';
import Banners from './admin/Banners.jsx';
import Pages from './admin/Pages.jsx';
import Settings from './admin/Settings.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="news/:id" element={<Article />} />
          <Route path="category/:slug" element={<Listing kind="category" />} />
          <Route path="videos" element={<Listing kind="video" />} />
          <Route path="reels" element={<Listing kind="reel" />} />
          <Route path="search" element={<Listing kind="search" />} />
          <Route path="tag/:tag" element={<Listing kind="tag" />} />
          <Route path="web-stories" element={<Stories />} />
          <Route path="page/:slug" element={<Page />} />
          <Route path="*" element={<div className="container empty">पेज नहीं मिला</div>} />
        </Route>
        <Route path="web-stories/:id" element={<StoryView />} />
        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:id" element={<ArticleEdit />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sections" element={<Sections />} />
          <Route path="stories" element={<AdminStories />} />
          <Route path="banners" element={<Banners />} />
          <Route path="pages" element={<Pages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
