/**
 * 검색 URL 매핑 관리
 *
 * Developer : 이수정
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SearchResultPage from '../pages/product/SearchResultPage';

const SearchRoutes = () => {
  return (
    <Routes>
      <Route path="/results" element={<SearchResultPage />} />
    </Routes>
  );
};

export default SearchRoutes;