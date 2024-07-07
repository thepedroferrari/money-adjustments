import React from 'react';
import { useData } from '../hooks/useData';
import './FileUpload.css';

const FileUpload: React.FC = () => {
  const { handleFileUpload } = useData();

  return (
    <div className="file-upload">
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

export default FileUpload;
