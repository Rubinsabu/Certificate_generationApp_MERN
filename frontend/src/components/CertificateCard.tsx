import React from 'react';
import type { Certificate } from '../models/Certificate';

interface Props {
  certificate: Certificate;
}

const CertificateCard: React.FC<Props> = ({ certificate }) => {
  return (
    <div className="bg-green-50 border border-green-400 p-4 rounded-lg">
      <p className="text-lg font-medium text-green-800">{certificate.name}</p>
      <a
        href={certificate.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline text-sm"
      >
        Download Certificate
      </a>
    </div>
  );
};

export default CertificateCard;
