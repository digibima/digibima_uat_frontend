import { useEffect } from 'react';
import { CallApi } from "../api";

export default function FormPage() {
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await CallApi('/api/getuserinfo', 'POST', "23|Ik0soPlAMnhDDAhk57Sw3890m8L24n8KF4NdQ4R5dbb14a5f");
      } catch (error) {
        console.error('Error calling API:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Form Page</h1>
    </div>
  );
}

