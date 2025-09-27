import React, { useState } from 'react';
import type { Certificate } from '../models/Certificate';
import { CertificateViewModel } from '../viewmodels/CertificateViewModel';
import CertificateCard from '../components/CertificateCard';

const CertificateView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  const viewModel = new CertificateViewModel();

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const certs = await viewModel.uploadFile(file);
      setCertificates(certs);
    } catch (err) {
      console.error(err);
      alert('Error uploading or generating certificates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Certificate Generator</h1>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full text-sm text-gray-600"
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          {loading ? 'Generating...' : 'Upload & Generate'}
        </button>

        <div className="mt-6 space-y-4">
          {certificates.map((cert, index) => (
            <CertificateCard key={index} certificate={cert} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
