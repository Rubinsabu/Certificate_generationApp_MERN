import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL;
import type { Certificate } from '../models/Certificate';

export class CertificateViewModel {
  async uploadFile(file: File): Promise<Certificate[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<Certificate[]>(
      `${baseURL}/api/certificates/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data;
  }
}
