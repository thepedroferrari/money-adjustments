import React from 'react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Footer from './components/Footer';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  return (
    <DataProvider>
      <div className="app">
        <FileUpload />
        <DataTable />
        <Footer />
      </div>
    </DataProvider>
  );
};

export default App;
