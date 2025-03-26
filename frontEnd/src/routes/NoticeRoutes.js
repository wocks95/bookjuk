/**
 * 공지사항 URL 매핑 관리
 *
 * Developer : 김민희
 */

import { Route, Routes } from 'react-router-dom';
import NoticePage from '../pages/notice/NoticePage';
import NoticeRegistPage from '../pages/notice/NoticeRegistPage';
import NoticeDetailPage from '../pages/notice/NoticeDetailPage';
import NoticeModifyPage from '../pages/notice/NoticeModifyPage';

const NoticeRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<NoticePage />} />
        <Route path="/regist" element={<NoticeRegistPage />} />
        <Route path="/detail/:id" element={<NoticeDetailPage />} />
        <Route path="/modify/:id" element={<NoticeModifyPage />} />
      </Routes>
    </>
  );
};

export default NoticeRoutes;
