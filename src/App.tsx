import React from 'react';
import DataTable from './components/DataTable';
import FileUpload from './components/FileUpload';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="app">
      <FileUpload />
      <DataTable />
      <Footer />
    </div>
  );
};

export default App;
