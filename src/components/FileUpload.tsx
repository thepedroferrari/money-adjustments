import React from 'react';
import './FileUpload.css';
import { useStore } from '../hooks/useStore';

const FileUpload: React.FC = () => {
  const handleFileUpload = useStore((state) => state.handleFileUpload);

  return (
    <div className="file-upload">
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

export default FileUpload;
